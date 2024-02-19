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
  UserLinkId,
} from './providers/provider'

const DefaultLayoutManager = 'bos.dapplets.near/widget/DefaultLayoutManager'

export type InsertionPointName = string

export class ContextManager {
  public readonly context: IContextNode

  #adapter: IAdapter
  #widgetFactory: BosWidgetFactory
  #layoutManagers: Map<InsertionPointName, LayoutManager> = new Map()
  #mutationManager: MutationManager
  #userLinks: Map<UserLinkId, BosUserLink> = new Map()
  #apps: Map<AppId, AppMetadata> = new Map()

  constructor(
    context: IContextNode,
    adapter: IAdapter,
    widgetFactory: BosWidgetFactory,
    mutationManager: MutationManager
  ) {
    this.context = context
    this.#adapter = adapter
    this.#widgetFactory = widgetFactory
    this.#mutationManager = mutationManager
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
    this.#layoutManagers.get(link.insertionPoint)?.addUserLink(link)
  }

  removeUserLink(link: BosUserLink) {
    this.#userLinks.delete(link.id)
    this.#layoutManagers.get(link.insertionPoint)?.removeUserLink(link.id)
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

  injectLayoutManager(insPointName: string) {
    const insertionPoints = this.#adapter.getInsertionPoints(this.context)
    const insPoint = insertionPoints.find((ip) => ip.name === insPointName)

    if (!insPoint) {
      return
    }

    const bosWidgetId = insPoint.bosLayoutManager ?? DefaultLayoutManager
    const layoutManagerElement = this.#widgetFactory.createWidget(bosWidgetId)

    const layoutManager = new LayoutManager(layoutManagerElement, this)

    try {
      // Inject layout manager
      this.#adapter.injectElement(layoutManagerElement, this.context, insPoint.name)

      this.#layoutManagers.set(insPoint.name, layoutManager)

      const suitableLinks = Array.from(this.#userLinks.values()).filter(
        (link) => link.insertionPoint === insPoint.name
      )

      // Add existing links to layout managers injected later (for lazy loading websites)
      suitableLinks.forEach((link) => layoutManager.addUserLink(link))

      // Add existing apps to the layout manager
      this.#apps.forEach((app) => layoutManager.addAppMetadata(app))
    } catch (err) {
      console.error(err)
    }
  }

  destroy() {
    this.#layoutManagers.forEach((lm) => lm.destroy())
    this.#layoutManagers.clear()
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
