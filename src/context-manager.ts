import { BosWidgetFactory } from './bos/bos-widget-factory'
import { IAdapter } from './core/adapters/interface'
import { IContextNode } from './core/tree/types'
import { LayoutManager } from './layout-manager'
import { MutationManager } from './mutation-manager'
import {
  AppId,
  AppMetadata,
  AppMetadataTarget,
  BosUserLink,
  InjectableTarget,
  UserLinkId,
} from './providers/provider'

export type InsertionPointName = string

export class ContextManager {
  public readonly context: IContextNode

  #adapter: IAdapter
  #widgetFactory: BosWidgetFactory
  #layoutManagers: Map<InsertionPointName, LayoutManager> = new Map()
  #mutationManager: MutationManager
  #userLinks: Map<UserLinkId, BosUserLink> = new Map()
  #apps: Map<AppId, AppMetadata> = new Map()
  #defaultLayoutManager: string
  #redirectMap: any = null

  // ToDo: duplcated in ContextManager and LayoutManager
  #refComponents = new Map<React.FC<unknown>, InjectableTarget>()

  constructor(
    context: IContextNode,
    adapter: IAdapter,
    widgetFactory: BosWidgetFactory,
    mutationManager: MutationManager,
    defaultLayoutManager: string
  ) {
    this.context = context
    this.#adapter = adapter
    this.#widgetFactory = widgetFactory
    this.#mutationManager = mutationManager
    this.#defaultLayoutManager = defaultLayoutManager
  }

  forceUpdate() {
    this.#layoutManagers.forEach((lm) => lm.forceUpdate())
  }

  enableEditMode() {
    this.#layoutManagers.forEach((lm) => lm.enableEditMode())
  }

  disableEditMode() {
    this.#layoutManagers.forEach((lm) => lm.disableEditMode())
  }

  addUserLink(link: BosUserLink) {
    this.#userLinks.set(link.id, link) // save link for further layout managers
    this.#layoutManagers.forEach((lm, lmInsPoint) => {
      lm.addUserLink(link, link.insertionPoint === lmInsPoint)
    })
  }

  removeUserLink(link: BosUserLink) {
    this.#userLinks.delete(link.id)
    this.#layoutManagers.forEach((lm) => lm.removeUserLink(link.id))
  }

  addAppMetadata(appMetadata: AppMetadata) {
    const injectableTargets = appMetadata.targets.filter((target) =>
      this._isTargetInjectable(target, appMetadata.id)
    )

    // Exclude apps that already injected (for `injectOnce` targets)
    if (injectableTargets.length === 0) {
      return
    }

    const metadataWithSuitableTargets = {
      ...appMetadata,
      targets: injectableTargets,
    }

    this.#apps.set(appMetadata.id, metadataWithSuitableTargets) // save app for further layout managers
    this.#layoutManagers.forEach((lm) => lm.addAppMetadata(metadataWithSuitableTargets))
  }

  removeAppMetadata(appGlobalId: AppId) {
    this.#apps.delete(appGlobalId)
    this.#layoutManagers.forEach((lm) => lm.removeAppMetadata(appGlobalId))
  }

  async createUserLink(globalAppId: AppId) {
    const createdLink = await this.#mutationManager.createLink(globalAppId, this.context)

    this.addUserLink(createdLink)
  }

  async deleteUserLink(userLink: BosUserLink) {
    await this.#mutationManager.deleteUserLink(userLink.id)

    this.removeUserLink(userLink)
  }

  setRedirectMap(redirectMap: any) {
    this.#redirectMap = redirectMap
    this.#layoutManagers.forEach((lm) => lm.setRedirectMap(redirectMap))
  }

  injectLayoutManager(insPointName: string) {
    const insertionPoints = this.#adapter.getInsertionPoints(this.context)
    const insPoint = insertionPoints.find((ip) => ip.name === insPointName)

    if (!insPoint) {
      return
    }

    const bosWidgetId = insPoint.bosLayoutManager ?? this.#defaultLayoutManager
    const layoutManagerElement = this.#widgetFactory.createWidget(bosWidgetId)

    const contextElement = this.#adapter.getContextElement(this.context)
    const insPointElement = this.#adapter.getInsertionPointElement(this.context, insPointName)

    if (!contextElement) {
      throw new Error('No context element found')
    }

    if (!insPointElement) {
      throw new Error('No insertion point element found')
    }

    const layoutManager = new LayoutManager(
      layoutManagerElement,
      contextElement,
      insPointElement,
      this
    )

    try {
      // Inject layout manager
      this.#adapter.injectElement(layoutManagerElement, this.context, insPoint.name)

      this.#layoutManagers.set(insPoint.name, layoutManager)

      // Add existing links to layout managers injected later (for lazy loading websites)
      Array.from(this.#userLinks.values()).forEach((link) =>
        layoutManager.addUserLink(link, link.insertionPoint === insPoint.name)
      )

      // Add existing apps to the layout manager
      this.#apps.forEach((app) => layoutManager.addAppMetadata(app))

      layoutManager.setRedirectMap(this.#redirectMap)

      // Add existing React component refereneces from portals
      this.#refComponents.forEach((target, cmp) => {
        if (target.injectTo === insPoint.name) {
          layoutManager.injectComponent(target, cmp)
        }
      })
    } catch (err) {
      console.error(err)
    }
  }

  destroyLayoutManager(insPointName: string) {
    this.#layoutManagers.get(insPointName)?.destroy()
    this.#layoutManagers.delete(insPointName)
  }

  destroy() {
    this.#layoutManagers.forEach((lm) => lm.destroy())
    this.#layoutManagers.clear()
    this.#refComponents.clear()
  }

  injectComponent<T>(target: InjectableTarget, cmp: React.FC<T>) {
    // save refs for future contexts
    this.#refComponents.set(cmp as React.FC<unknown>, target)
    this.#layoutManagers.get(target.injectTo)?.injectComponent(target, cmp)
  }

  unjectComponent<T>(target: InjectableTarget, cmp: React.FC<T>) {
    this.#refComponents.delete(cmp as React.FC<unknown>)
    this.#layoutManagers.get(target.injectTo)?.unjectComponent(target, cmp)
  }

  private _isTargetInjectable(target: AppMetadataTarget, appId: string) {
    // The limitation is only for `injectOnce` targets
    if (!target.injectOnce) return true

    // ToDo: looks that target should have an unique identifier?
    const userLinks = Array.from(this.#userLinks.values())
    const isInjected = !!userLinks.find(
      (link) =>
        link.appId === appId &&
        link.namespace === target.namespace &&
        link.insertionPoint === target.injectTo &&
        link.bosWidgetId === target.componentId
    )

    return !isInjected
  }
}
