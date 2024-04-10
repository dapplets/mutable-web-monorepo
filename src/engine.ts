import { IAdapter } from './core/adapters/interface'
import { DynamicHtmlAdapter } from './core/adapters/dynamic-html-adapter'
import { BosWidgetFactory } from './bos/bos-widget-factory'
import {
  AppMetadata,
  IProvider,
  Mutation,
  MutationWithSettings,
  ParserConfig,
} from './providers/provider'
import { WalletSelector } from '@near-wallet-selector/core'
import { NearConfig, bosLoaderUrl, getNearConfig } from './constants'
import { NearSigner } from './providers/near-signer'
import { SocialDbProvider } from './providers/social-db-provider'
import { IContextListener, IContextNode, ITreeBuilder } from './core/tree/types'
import { PureTreeBuilder } from './core/tree/pure-tree/pure-tree-builder'
import { ContextManager } from './context-manager'
import { MutationManager } from './mutation-manager'
import { JsonParser } from './core/parsers/json-parser'
import { BosParser } from './core/parsers/bos-parser'
import { PureContextNode } from './core/tree/pure-tree/pure-context-node'
import { IStorage } from './storage/storage'
import { Repository } from './storage/repository'
import { JsonStorage } from './storage/json-storage'

export enum AdapterType {
  Bos = 'bos',
  Microdata = 'microdata',
  Json = 'json',
}

export type EngineConfig = {
  networkId: string
  gatewayId: string
  selector: WalletSelector
  storage: IStorage
  bosElementName?: string
}

export class Engine implements IContextListener {
  #provider: IProvider
  #bosWidgetFactory: BosWidgetFactory
  #selector: WalletSelector
  #contextManagers: Map<IContextNode, ContextManager> = new Map()
  #mutationManager: MutationManager
  #nearConfig: NearConfig
  #redirectMap: any = null
  #devModePollingTimer: number | null = null
  #repository: Repository

  adapters: Set<IAdapter> = new Set()
  treeBuilder: ITreeBuilder | null = null
  started: boolean = false

  constructor(private config: EngineConfig) {
    this.#bosWidgetFactory = new BosWidgetFactory({
      networkId: this.config.networkId,
      selector: this.config.selector,
      tagName: this.config.bosElementName ?? 'bos-component',
    })
    this.#selector = this.config.selector
    const nearConfig = getNearConfig(this.config.networkId)
    const nearSigner = new NearSigner(this.#selector, nearConfig.nodeUrl)
    this.#provider = new SocialDbProvider(nearSigner, nearConfig.contractName)
    this.#mutationManager = new MutationManager(this.#provider)
    this.#nearConfig = nearConfig
    this.#repository = new Repository(new JsonStorage(this.config.storage))
  }

  async handleContextStarted(context: IContextNode): Promise<void> {
    // if (!this.started) return;
    if (!context.id) return

    // We don't wait adapters here
    // Find and load adapters for the given context
    const parserConfigs = this.#mutationManager.filterSuitableParsers(context)
    for (const config of parserConfigs) {
      const adapter = this.createAdapter(config)
      this.registerAdapter(adapter)

      console.log(`[MutableWeb] Loaded new adapter: ${adapter.namespace}`)
    }

    // ToDo: do not iterate over all adapters
    const adapter = Array.from(this.adapters).find((adapter) => {
      return adapter.getInsertionPoints(context).length > 0
    })

    if (!adapter) return

    const contextManager = new ContextManager(
      context,
      adapter,
      this.#bosWidgetFactory,
      this.#mutationManager,
      this.#nearConfig.defaultLayoutManager
    )

    this.#contextManagers.set(context, contextManager)

    const links = await this.#mutationManager.getLinksForContext(context)
    const apps = this.#mutationManager.filterSuitableApps(context)

    links.forEach((link) => contextManager.addUserLink(link))
    apps.forEach((app) => contextManager.addAppMetadata(app))
    contextManager.setRedirectMap(this.#redirectMap)
  }

  handleContextChanged(context: IContextNode, oldParsedContext: any): void {
    if (!this.started) return

    this.#contextManagers.get(context)?.forceUpdate()
  }

  handleContextFinished(context: IContextNode): void {
    if (!this.started) return

    // ToDo: will layout managers be removed from the DOM?
    this.#contextManagers.delete(context)
  }

  handleInsPointStarted(context: IContextNode, newInsPoint: string): void {
    this.#contextManagers.get(context)?.injectLayoutManager(newInsPoint)
  }

  handleInsPointFinished(context: IContextNode, oldInsPoint: string): void {
    // ToDo: do nothing because IP unmounted?
  }

  async start(mutationId?: string): Promise<void> {
    if (!mutationId) {
      const favoriteMutationId = await this.getFavoriteMutation()
      mutationId = favoriteMutationId ?? this.#nearConfig.defaultMutationId
    }

    const mutations = await this.getMutations()
    const mutation = mutations.find((mutation) => mutation.id === mutationId) ?? null

    if (mutation) {
      // load mutation and apps
      await this.#mutationManager.switchMutation(mutation)

      // save last usage
      const currentDate = new Date().toISOString()
      await this.#repository.setMutationLastUsage(mutation.id, currentDate)
    } else {
      console.error('No suitable mutations found')
    }

    this.treeBuilder = new PureTreeBuilder(this)
    this.started = true

    this._updateRootContext()

    console.log('Mutable Web Engine started!', {
      engine: this,
      provider: this.#provider,
    })
  }

  stop() {
    this.started = false
    this.adapters.forEach((adapter) => this.unregisterAdapter(adapter))
    this.#contextManagers.forEach((cm) => cm.destroy())
    this.adapters.clear()
    this.#contextManagers.clear()
    this.treeBuilder = null
  }

  async getMutations(): Promise<MutationWithSettings[]> {
    // ToDo: use real context from the PureTreeBuilder
    const context = new PureContextNode('engine', 'website')
    context.parsedContext = { id: window.location.hostname }

    const mutations = await this.#mutationManager.getMutationsForContext(context)
    const favoriteMutationId = await this.#repository.getFavoriteMutation()

    return Promise.all(
      mutations.map(async (mutation) => ({
        ...mutation,
        settings: {
          isFavorite: favoriteMutationId === mutation.id,
          lastUsage: await this.#repository.getMutationLastUsage(mutation.id),
        },
      }))
    )
  }

  async switchMutation(mutationId: string): Promise<void> {
    const currentMutation = await this.getCurrentMutation()
    if (currentMutation?.id === mutationId) return

    this.stop()
    await this.start(mutationId)
  }

  async getCurrentMutation(): Promise<MutationWithSettings | null> {
    const mutation = this.#mutationManager?.mutation
    if (!mutation) return null

    const favoriteMutationId = await this.#repository.getFavoriteMutation()

    return {
      ...mutation,
      settings: {
        isFavorite: favoriteMutationId === mutation.id,
        lastUsage: await this.#repository.getMutationLastUsage(mutation.id),
      },
    }
  }

  async enableDevMode(options?: { polling: boolean }) {
    if (options?.polling) {
      this.#devModePollingTimer = setInterval(
        () => this._tryFetchAndUpdateRedirects(true),
        1500
      ) as any as number
    } else {
      this.#devModePollingTimer = null
      await this._tryFetchAndUpdateRedirects(false)
    }
  }

  disableDevMode() {
    if (this.#devModePollingTimer !== null) {
      clearInterval(this.#devModePollingTimer)
    }

    this.#redirectMap = null
    this.#contextManagers.forEach((cm) => cm.setRedirectMap(null))
  }

  registerAdapter(adapter: IAdapter) {
    if (!this.treeBuilder) throw new Error('Tree builder is not inited')
    this.treeBuilder.appendChild(this.treeBuilder.root, adapter.context)
    this.adapters.add(adapter)
    adapter.start()
  }

  unregisterAdapter(adapter: IAdapter) {
    if (!this.treeBuilder) throw new Error('Tree builder is not inited')
    adapter.stop()
    this.treeBuilder.removeChild(this.treeBuilder.root, adapter.context)
    this.adapters.delete(adapter)
  }

  createAdapter(config?: ParserConfig): IAdapter {
    if (!this.treeBuilder) {
      throw new Error('Tree builder is not inited')
    }

    switch (config?.parserType) {
      case 'json':
        return new DynamicHtmlAdapter(
          document.body,
          this.treeBuilder,
          config.id,
          new JsonParser(config as any) // ToDo: add try catch because config can be invalid
        )

      case 'bos':
        return new DynamicHtmlAdapter(
          document.body,
          this.treeBuilder,
          config.id,
          new BosParser(config as any)
        )

      default:
        throw new Error('Incompatible adapter type')
    }
  }

  async setFavoriteMutation(mutationId: string | null): Promise<void> {
    return this.#repository.setFavoriteMutation(mutationId)
  }

  async getFavoriteMutation(): Promise<string | null> {
    return this.#repository.getFavoriteMutation()
  }

  async removeMutationFromRecents(mutationId: string): Promise<void> {
    await this.#repository.setMutationLastUsage(mutationId, null)
  }

  async getApplications(): Promise<AppMetadata[]> {
    return this.#provider.getApplications()
  }

  async createMutation(mutation: Mutation): Promise<void> {
    // ToDo: move to provider?
    if (await this.#provider.getMutation(mutation.id)) {
      throw new Error("Mutation with that ID already exists")
    }
    
    await this.#provider.saveMutation(mutation)
  }

  async editMutation(mutation: Mutation): Promise<void> {
    await this.#provider.saveMutation(mutation)
  }

  private async _tryFetchAndUpdateRedirects(polling: boolean) {
    try {
      const res = await fetch(bosLoaderUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })

      if (!res.ok) {
        throw new Error('Network response was not OK')
      }

      const data = await res.json()

      // This function is async
      if (polling && this.#devModePollingTimer === null) {
        return
      }

      this.#redirectMap = data?.components ?? null
      this.#contextManagers.forEach((cm) => cm.setRedirectMap(this.#redirectMap))
    } catch (err) {
      console.error(err)
      this.disableDevMode()
    }
  }

  private _updateRootContext() {
    if (!this.treeBuilder) throw new Error('Tree builder is not inited')

    // ToDo: instantiate root context with data initially
    // ToDo: looks like circular dependency
    this.treeBuilder.updateParsedContext(this.treeBuilder.root, {
      id: window.location.hostname,
      url: window.location.href,
      mutationId: this.#mutationManager.mutation?.id ?? null,
      gatewayId: this.config.gatewayId,
    })
  }
}
