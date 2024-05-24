import { IAdapter } from './core/adapters/interface'
import { DynamicHtmlAdapter } from './core/adapters/dynamic-html-adapter'
import { BosWidgetFactory } from './bos/bos-widget-factory'
import {
  AdapterType,
  AppMetadata,
  AppWithSettings,
  IProvider,
  InjectableTarget,
  Mutation,
  MutationWithSettings,
  ParserConfig,
} from './providers/provider'
import { WalletSelector } from '@near-wallet-selector/core'
import {
  NearConfig,
  ViewportElementId,
  ViewportInnerElementId,
  bosLoaderUrl,
  getNearConfig,
} from './constants'
import { NearSigner } from './providers/near-signer'
import { SocialDbProvider } from './providers/social-db-provider'
import { IContextListener, IContextNode, ITreeBuilder } from './core/tree/types'
import { PureTreeBuilder } from './core/tree/pure-tree/pure-tree-builder'
import { ContextManager } from './context-manager'
import { MutationManager } from './mutation-manager'
import { JsonParser, JsonParserConfig } from './core/parsers/json-parser'
import { BosParser, BosParserConfig } from './core/parsers/bos-parser'
import { MutableWebParser } from './core/parsers/mweb-parser'
import { PureContextNode } from './core/tree/pure-tree/pure-context-node'
import { IStorage } from './storage/storage'
import { Repository } from './storage/repository'
import { JsonStorage } from './storage/json-storage'
import { LocalStorage } from './storage/local-storage'

export type EngineConfig = {
  networkId: string
  gatewayId: string
  selector: WalletSelector
  storage?: IStorage
  bosElementName?: string
  bosElementStyleSrc?: string
}

// ToDo: dirty hack
export let engineSingleton: Engine | null = null

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
  #viewport: HTMLDivElement | null = null

  // ToDo: duplcated in ContextManager and LayoutManager
  #refComponents = new Map<React.FC<unknown>, InjectableTarget>()

  adapters = new Map<string, IAdapter>()
  treeBuilder: ITreeBuilder | null = null
  started: boolean = false

  constructor(private config: EngineConfig) {
    if (!this.config.storage) {
      this.config.storage = new LocalStorage('mutable-web-engine')
    }

    this.#bosWidgetFactory = new BosWidgetFactory({
      tagName: this.config.bosElementName ?? 'bos-component',
      bosElementStyleSrc: this.config.bosElementStyleSrc,
    })
    this.#selector = this.config.selector
    const nearConfig = getNearConfig(this.config.networkId)
    const jsonStorage = new JsonStorage(this.config.storage)
    this.#nearConfig = nearConfig
    this.#repository = new Repository(jsonStorage)
    const nearSigner = new NearSigner(this.#selector, jsonStorage, nearConfig)
    this.#provider = new SocialDbProvider(nearSigner, nearConfig.contractName)
    this.#mutationManager = new MutationManager(this.#provider)

    engineSingleton = this
  }

  async handleContextStarted(context: IContextNode): Promise<void> {
    // if (!this.started) return;
    if (!context.id) return

    // We don't wait adapters here
    const parserConfigs = this.#mutationManager.filterSuitableParsers(context)
    for (const config of parserConfigs) {
      const adapter = this.createAdapter(config)
      this.registerAdapter(adapter)
    }

    const adapter = this.adapters.get(context.namespace)

    if (!adapter) return

    const contextManager = new ContextManager(
      context,
      adapter,
      this.#bosWidgetFactory,
      this.#mutationManager,
      this.#nearConfig.defaultLayoutManager
    )

    this.#contextManagers.set(context, contextManager)

    await this._addAppsAndLinks(context)

    contextManager.setRedirectMap(this.#redirectMap)

    // Add existing React component refereneces from portals
    this.#refComponents.forEach((target, cmp) => {
      if (MutationManager._isTargetMet(target, context)) {
        contextManager.injectComponent(target, cmp)
      }
    })
  }

  handleContextChanged(context: IContextNode, oldParsedContext: any): void {
    if (!this.started) return

    this.#contextManagers.get(context)?.forceUpdate()
  }

  handleContextFinished(context: IContextNode): void {
    if (!this.started) return

    this.#contextManagers.get(context)?.destroy()
    this.#contextManagers.delete(context)
  }

  handleInsPointStarted(context: IContextNode, newInsPoint: string): void {
    this.#contextManagers.get(context)?.injectLayoutManager(newInsPoint)
  }

  handleInsPointFinished(context: IContextNode, oldInsPoint: string): void {
    this.#contextManagers.get(context)?.destroyLayoutManager(oldInsPoint)
  }

  getLastUsedMutation = async (): Promise<string | null> => {
    const allMutations = await this.getMutations()
    const hostname = window.location.hostname
    const lastUsedData = await Promise.all(
      allMutations.map(async (m) => ({
        id: m.id,
        lastUsage: await this.#repository.getMutationLastUsage(m.id, hostname),
      }))
    )
    const usedMutationsData = lastUsedData
      .filter((m) => m.lastUsage)
      .map((m) => ({ id: m.id, lastUsage: new Date(m.lastUsage!).getTime() }))
    if (usedMutationsData?.length) {
      if (usedMutationsData.length === 1) return usedMutationsData[0].id
      let lastMutationId = usedMutationsData[0].id
      for (let i = 1; i < usedMutationsData.length; i++) {
        if (usedMutationsData[i].lastUsage > usedMutationsData[i - 1].lastUsage) {
          lastMutationId = usedMutationsData[i].id
        }
      }
      return lastMutationId
    } else {
      // Activate default mutation for new users
      return this.#nearConfig.defaultMutationId
    }
  }

  async start(mutationId?: string | null): Promise<void> {
    if (mutationId === undefined) {
      mutationId = (await this.getFavoriteMutation()) || (await this.getLastUsedMutation())
    }

    if (mutationId !== null) {
      const mutations = await this.getMutations()
      const mutation = mutations.find((mutation) => mutation.id === mutationId) ?? null

      if (mutation) {
        // load mutation
        await this.#mutationManager.switchMutation(mutation)

        // load non-disabled apps only
        await Promise.all(
          mutation.apps.map(async (appId) => {
            const isAppEnabled = await this.#repository.getAppEnabledStatus(mutation.id, appId)
            if (!isAppEnabled) return

            return this.#mutationManager.loadApp(appId)
          })
        )

        // save last usage
        const currentDate = new Date().toISOString()
        await this.#repository.setMutationLastUsage(
          mutation.id,
          currentDate,
          window.location.hostname
        )
      } else {
        console.error('No suitable mutations found')
      }
    }

    this.treeBuilder = new PureTreeBuilder(this)
    this.started = true

    this._attachViewport()
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
    this._detachViewport()
  }

  async getMutations(): Promise<MutationWithSettings[]> {
    // ToDo: use real context from the PureTreeBuilder
    const context = new PureContextNode('engine', 'website')
    context.parsedContext = { id: window.location.hostname }

    const mutations = await this.#mutationManager.getMutationsForContext(context)

    return Promise.all(mutations.map((mut) => this._populateMutationWithSettings(mut)))
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

    return this._populateMutationWithSettings(mutation)
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
    this.adapters.set(adapter.namespace, adapter)
    adapter.start()
    console.log(`[MutableWeb] Loaded new adapter: ${adapter.namespace}`)
  }

  unregisterAdapter(adapter: IAdapter) {
    if (!this.treeBuilder) throw new Error('Tree builder is not inited')
    adapter.stop()
    this.treeBuilder.removeChild(this.treeBuilder.root, adapter.context)
    this.adapters.delete(adapter.namespace)
  }

  createAdapter(config: ParserConfig): IAdapter {
    if (!this.treeBuilder) {
      throw new Error('Tree builder is not inited')
    }

    switch (config.parserType) {
      case AdapterType.Json:
        return new DynamicHtmlAdapter(
          document.documentElement,
          this.treeBuilder,
          config.id,
          new JsonParser(config) // ToDo: add try catch because config can be invalid
        )

      case AdapterType.Bos:
        return new DynamicHtmlAdapter(
          document.documentElement,
          this.treeBuilder,
          config.id,
          new BosParser(config)
        )

      case AdapterType.MWeb:
        return new DynamicHtmlAdapter(
          document.body,
          this.treeBuilder,
          config.id,
          new MutableWebParser()
        )

      default:
        throw new Error('Incompatible adapter type')
    }
  }

  async setFavoriteMutation(mutationId: string | null): Promise<void> {
    return this.#repository.setFavoriteMutation(mutationId)
  }

  async getFavoriteMutation(): Promise<string | null> {
    const value = await this.#repository.getFavoriteMutation()
    return value ?? null
  }

  async removeMutationFromRecents(mutationId: string): Promise<void> {
    await this.#repository.setMutationLastUsage(mutationId, null, window.location.hostname)
  }

  async getApplications(): Promise<AppMetadata[]> {
    return this.#provider.getApplications()
  }

  async createMutation(mutation: Mutation): Promise<MutationWithSettings> {
    // ToDo: move to provider?
    if (await this.#provider.getMutation(mutation.id)) {
      throw new Error('Mutation with that ID already exists')
    }

    await this.#provider.saveMutation(mutation)

    return this._populateMutationWithSettings(mutation)
  }

  async editMutation(mutation: Mutation): Promise<MutationWithSettings> {
    await this.#provider.saveMutation(mutation)

    // If the current mutation is edited, reload it
    if (mutation.id === this.#mutationManager?.mutation?.id) {
      this.stop()
      await this.start(mutation.id)
    }

    return this._populateMutationWithSettings(mutation)
  }

  injectComponent<T>(target: InjectableTarget, cmp: React.FC<T>) {
    // save refs for future contexts
    this.#refComponents.set(cmp as React.FC<unknown>, target)

    this.#contextManagers.forEach((contextManager, context) => {
      if (MutationManager._isTargetMet(target, context)) {
        contextManager.injectComponent(target, cmp)
      }
    })
  }

  unjectComponent<T>(target: InjectableTarget, cmp: React.FC<T>) {
    this.#refComponents.delete(cmp as React.FC<unknown>)

    this.#contextManagers.forEach((contextManager, context) => {
      if (MutationManager._isTargetMet(target, context)) {
        contextManager.unjectComponent(target, cmp)
      }
    })
  }

  async getAppsFromMutation(mutationId: string): Promise<AppWithSettings[]> {
    const { mutation: currentMutation } = this.#mutationManager

    // don't fetch mutation if fetched already
    const mutation =
      currentMutation?.id === mutationId
        ? currentMutation
        : await this.#provider.getMutation(mutationId)

    if (!mutation) {
      throw new Error(`Mutation doesn't exist: ${mutationId}`)
    }

    // ToDo: improve readability
    return Promise.all(
      mutation.apps.map((appId) =>
        this.#provider
          .getApplication(appId)
          .then((appMetadata) => (appMetadata ? this._populateAppWithSettings(appMetadata) : null))
      )
    ).then((apps) => apps.filter((app) => app !== null) as AppWithSettings[])
  }

  async enableApp(appId: string): Promise<void> {
    const currentMutationId = this.#mutationManager.mutation?.id

    if (!currentMutationId) {
      throw new Error('Mutation is not active')
    }

    await this.#repository.setAppEnabledStatus(currentMutationId, appId, true)

    await this._startApp(appId)
  }

  async disableApp(appId: string): Promise<void> {
    const currentMutationId = this.#mutationManager.mutation?.id

    if (!currentMutationId) {
      throw new Error('Mutation is not active')
    }

    await this.#repository.setAppEnabledStatus(currentMutationId, appId, false)

    await this._stopApp(appId)
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
      // this.disableDevMode()
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

  private async _populateMutationWithSettings(mutation: Mutation): Promise<MutationWithSettings> {
    const isFavorite = (await this.getFavoriteMutation()) === mutation.id
    const lastUsage = await this.#repository.getMutationLastUsage(
      mutation.id,
      window.location.hostname
    )

    return {
      ...mutation,
      settings: {
        isFavorite,
        lastUsage,
      },
    }
  }

  private async _populateAppWithSettings(app: AppMetadata): Promise<AppWithSettings> {
    const currentMutationId = this.#mutationManager.mutation?.id

    if (!currentMutationId) throw new Error('Mutation is not active')

    return {
      ...app,
      settings: {
        isEnabled: await this.#repository.getAppEnabledStatus(currentMutationId, app.id),
      },
    }
  }

  private _attachViewport() {
    if (this.#viewport) throw new Error('Already attached')

    const viewport = document.createElement('div')
    viewport.id = ViewportElementId
    viewport.setAttribute('data-mweb-shadow-host', '')
    const shadowRoot = viewport.attachShadow({ mode: 'open' })

    // It will prevent inheritance without affecting other CSS defined within the ShadowDOM.
    // https://stackoverflow.com/a/68062098
    const disableCssInheritanceStyle = document.createElement('style')
    disableCssInheritanceStyle.innerHTML = ':host { all: initial; }'
    shadowRoot.appendChild(disableCssInheritanceStyle)

    if (this.config.bosElementStyleSrc) {
      const externalStyleLink = document.createElement('link')
      externalStyleLink.rel = 'stylesheet'
      externalStyleLink.href = this.config.bosElementStyleSrc
      shadowRoot.appendChild(externalStyleLink)
    }

    const viewportInner = document.createElement('div')
    viewportInner.id = ViewportInnerElementId
    viewportInner.setAttribute('data-bs-theme', 'light') // ToDo: parametrize

    // Context cannot be a shadow root node because mutation observer doesn't work there
    // So we need to select a child node for context
    viewportInner.setAttribute('data-mweb-context-type', 'shadow-dom')

    shadowRoot.appendChild(viewportInner)

    // Prevent event propagation from BOS-component to parent
    const EventsToStopPropagation = ['click', 'keydown', 'keyup', 'keypress']
    EventsToStopPropagation.forEach((eventName) => {
      viewport.addEventListener(eventName, (e) => e.stopPropagation())
    })

    document.body.appendChild(viewport)

    this.#viewport = viewport
  }

  private _detachViewport() {
    if (this.#viewport) {
      document.body.removeChild(this.#viewport)
      this.#viewport = null
    }
  }

  private async _startApp(appId: string): Promise<void> {
    if (!this.treeBuilder) throw new Error('Engine is not started')

    await this.#mutationManager.loadApp(appId)

    await this._traverseContextTree(
      (context) => this._addAppsAndLinks(context, [appId]),
      this.treeBuilder.root
    )
  }

  private async _stopApp(appId: string): Promise<void> {
    if (!this.treeBuilder) throw new Error('Engine is not started')

    await this._traverseContextTree(
      (context) => this._removeAppsAndLinks(context, [appId]),
      this.treeBuilder.root
    )

    await this.#mutationManager.unloadApp(appId)
  }

  private async _addAppsAndLinks(context: IContextNode, includedApps?: string[]) {
    const contextManager = this.#contextManagers.get(context)

    if (!contextManager) return

    const links = await this.#mutationManager.getLinksForContext(context, includedApps)
    const apps = this.#mutationManager.filterSuitableApps(context, includedApps)

    links.forEach((link) => contextManager.addUserLink(link))
    apps.forEach((app) => contextManager.addAppMetadata(app))
  }

  private async _removeAppsAndLinks(context: IContextNode, includedApps: string[]) {
    const contextManager = this.#contextManagers.get(context)

    if (!contextManager) return

    const links = await this.#mutationManager.getLinksForContext(context, includedApps)

    links.forEach((link) => contextManager.removeUserLink(link))
    includedApps.forEach((appId) => contextManager.removeAppMetadata(appId))
  }

  private async _traverseContextTree(
    callback: (context: IContextNode) => Promise<void>,
    parent: IContextNode
  ): Promise<void> {
    await Promise.all([
      callback(parent),
      ...parent.children.map((child) => this._traverseContextTree(callback, child)),
    ])
  }
}
