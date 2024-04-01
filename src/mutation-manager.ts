import { IContextNode } from './core/tree/types'
import {
  AppId,
  AppMetadata,
  AppMetadataTarget,
  BosUserLink,
  IProvider,
  LinkIndexObject,
  Mutation,
  MutationId,
  ParserConfig,
  ScalarType,
  TargetCondition,
  UserLinkId,
} from './providers/provider'

export type AppWithTargetLinks = AppMetadata & {
  targets: { links: BosUserLink[] }[]
}

export class MutationManager {
  public mutation: Mutation | null = null

  #provider: IProvider
  #activeApps: AppMetadata[] = []
  #activeParsers: ParserConfig[] = []

  constructor(provider: IProvider) {
    this.#provider = provider
  }

  // #region Read methods

  async getAppsAndLinksForContext(context: IContextNode): Promise<AppWithTargetLinks[]> {
    const promises: Promise<AppWithTargetLinks>[] = []

    for (const app of this.#activeApps) {
      const suitableTargets = app.targets.filter((target) =>
        MutationManager._isTargetMet(target, context)
      )

      if (suitableTargets.length > 0) {
        // ToDo: batch requests
        const targetPromises = suitableTargets.map((target) =>
          this._getUserLinksForTarget(app.id, target, context).then((links) => ({
            ...target,
            links,
          }))
        )

        const appPromise = Promise.all(targetPromises).then((targets) => ({
          ...app,
          targets,
        }))

        promises.push(appPromise)
      }
    }

    const appLinksNested = await Promise.all(promises)

    return appLinksNested
  }

  async getMutationsForContext(context: IContextNode): Promise<Mutation[]> {
    const mutations = await this.#provider.getMutations()
    return mutations.filter((mutation) =>
      mutation.targets.some((target) => MutationManager._isTargetMet(target, context))
    )
  }

  // ToDo: replace with getAppsAndLinksForContext
  filterSuitableApps(context: IContextNode): AppMetadata[] {
    const suitableApps: AppMetadata[] = []

    for (const app of this.#activeApps) {
      const suitableTargets = app.targets.filter((target) =>
        MutationManager._isTargetMet(target, context)
      )

      if (suitableTargets.length > 0) {
        suitableApps.push({ ...app, targets: suitableTargets })
      }
    }

    return suitableApps
  }

  // ToDo: replace with getAppsAndLinksForContext
  async getLinksForContext(context: IContextNode): Promise<BosUserLink[]> {
    const promises: Promise<BosUserLink[]>[] = []

    for (const app of this.#activeApps) {
      const suitableTargets = app.targets.filter((target) =>
        MutationManager._isTargetMet(target, context)
      )

      // ToDo: batch requests
      suitableTargets.forEach((target) => {
        promises.push(this._getUserLinksForTarget(app.id, target, context))
      })
    }

    const appLinksNested = await Promise.all(promises)

    return appLinksNested.flat(2)
  }

  filterSuitableParsers(context: IContextNode): ParserConfig[] {
    const suitableParsers: ParserConfig[] = []

    for (const parser of this.#activeParsers) {
      const suitableTargets = parser.targets.filter((target) =>
        MutationManager._isTargetMet(target, context)
      )

      if (suitableTargets.length > 0) {
        suitableParsers.push({ ...parser, targets: suitableTargets })
      }
    }

    return suitableParsers
  }

  // #endregion

  // #region Write methods

  async switchMutation(mutation: Mutation | null): Promise<void> {
    if (!mutation) {
      this.#activeApps = []
      this.#activeParsers = []
      this.mutation = null

      return
    }

    const apps = await Promise.all(mutation.apps.map((app) => this.#provider.getApplication(app)))
    const activeApps = apps.flatMap((app) => (app ? [app] : [])) // filter empty apps

    // get parser ids from target namespaces
    const parserIds = [
      ...new Set(
        activeApps
          .map((app) => app.targets)
          .flat()
          .map((target) => target.namespace)
      ),
    ]

    const parsers = await Promise.all(parserIds.map((id) => this.#provider.getParserConfig(id)))
    const activeParsers = parsers.flatMap((parser) => (parser ? [parser] : [])) // filter empty parsers

    this.#activeApps = activeApps
    this.#activeParsers = activeParsers
    this.mutation = mutation

    console.log('Active apps: ', mutation.apps)
  }

  async createLink(appGlobalId: AppId, context: IContextNode): Promise<BosUserLink> {
    if (!this.mutation) {
      throw new Error('Mutation is not loaded')
    }

    const app = this.#activeApps.find((app) => app.id === appGlobalId)

    if (!app) {
      throw new Error('App is not active')
    }

    const suitableTargets = app.targets.filter((target) =>
      MutationManager._isTargetMet(target, context)
    )

    if (suitableTargets.length === 0) {
      throw new Error('No suitable targets found')
    }

    if (suitableTargets.length > 1) {
      throw new Error('More than one suitable targets found')
    }

    const [target] = suitableTargets

    const indexObject = MutationManager._buildLinkIndex(app.id, this.mutation.id, target, context)

    // ToDo: this limitation on the frontend side only
    if (target.injectOnce) {
      const existingLinks = await this.#provider.getLinksByIndex(indexObject)
      if (existingLinks.length > 0) {
        throw new Error(
          `The widget is injected already. The "injectOnce" parameter limits multiple insertion of widgets`
        )
      }
    }

    const indexedLink = await this.#provider.createLink(indexObject)

    return {
      id: indexedLink.id,
      appId: appGlobalId,
      namespace: target.namespace,
      authorId: indexedLink.authorId,
      bosWidgetId: target.componentId,
      insertionPoint: target.injectTo,
    }
  }

  async deleteUserLink(userLinkId: UserLinkId): Promise<void> {
    return this.#provider.deleteUserLink(userLinkId)
  }

  // #endregion

  // #region Private

  private async _getUserLinksForTarget(
    appId: string,
    target: AppMetadataTarget,
    context: IContextNode
  ): Promise<BosUserLink[]> {
    if (!this.mutation) throw new Error('Mutation is not loaded')

    const indexObject = MutationManager._buildLinkIndex(appId, this.mutation.id, target, context)

    const indexedLinks = await this.#provider.getLinksByIndex(indexObject)

    return indexedLinks.map((link) => ({
      id: link.id,
      appId: appId,
      authorId: link.authorId,
      namespace: target.namespace,
      bosWidgetId: target.componentId, // ToDo: unify
      insertionPoint: target.injectTo, // ToDo: unify
    }))
  }

  // #endregion

  // #region Utils

  static _buildLinkIndex(
    appId: AppId,
    mutationId: MutationId,
    target: AppMetadataTarget,
    context: IContextNode
  ): LinkIndexObject {
    const indexedContextData = this._buildIndexedContextValues(target.if, context.parsedContext)

    return {
      appId,
      mutationId,
      namespace: target.namespace,
      contextType: target.contextType,
      if: indexedContextData,
    }
  }

  static _buildIndexedContextValues(
    conditions: Record<string, TargetCondition>,
    values: Record<string, ScalarType>
  ): Record<string, ScalarType> {
    const object: Record<string, ScalarType> = {}

    for (const property in conditions) {
      if (conditions[property].index) {
        object[property] = values[property]
      }
    }

    return object
  }

  static _isTargetMet(
    target: Pick<AppMetadataTarget, 'namespace' | 'contextType' | 'if'>,
    context: Pick<IContextNode, 'namespace' | 'contextType' | 'parsedContext'>
  ): boolean {
    // ToDo: check insertion points?
    return (
      target.namespace === context.namespace &&
      target.contextType === context.contextType &&
      this._areConditionsMet(target.if, context.parsedContext)
    )
  }

  static _areConditionsMet(
    conditions: Record<string, TargetCondition>,
    values: Record<string, ScalarType>
  ): boolean {
    for (const property in conditions) {
      if (!this._isConditionMet(conditions[property], values[property])) {
        return false
      }
    }

    return true
  }

  static _isConditionMet(condition: TargetCondition, value: ScalarType): boolean {
    const { not: _not, eq: _eq, contains: _contains, in: _in, endsWith: _endsWith } = condition

    if (_not !== undefined) {
      return _not !== value
    }

    if (_eq !== undefined) {
      return _eq === value
    }

    if (_contains !== undefined && typeof value === 'string') {
      return value.includes(_contains)
    }

    if (_endsWith !== undefined && typeof value === 'string') {
      return value.endsWith(_endsWith)
    }

    if (_in !== undefined) {
      return _in.includes(value)
    }

    return false
  }

  // #endregion
}
