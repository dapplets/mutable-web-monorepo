import { BosComponent } from './bos/bos-widget'
import { ContextManager } from './context-manager'
import { IContextNode } from './core/tree/types'
import { AppId, AppMetadata, BosUserLink, InjectableTarget, UserLinkId } from './providers/provider'

export interface LayoutManagerProps {
  context: ContextTreeProps
  apps: {
    id: string
    metadata?: {
      name?: string
      description?: string
      image?: {
        ipfs_cid?: string
      }
    }
  }[]
  widgets: {
    linkId: UserLinkId
    linkAuthorId: string
    src: string
    props: {
      context: ContextTreeProps
      link: {
        id: UserLinkId
        authorId: string
      }
    }
  }[]
  components: { target: InjectableTarget; component: React.FC<unknown> }[]
  isEditMode: boolean

  createUserLink: (bosWidgetId: string) => Promise<void>
  deleteUserLink: (userLinkId: UserLinkId) => Promise<void>
  enableEditMode: () => void
  disableEditMode: () => void

  attachContextRef: (callback: (r: React.Component | Element | null | undefined) => void) => void
  attachInsPointRef: (callback: (r: React.Component | Element | null | undefined) => void) => void
}

interface ContextTreeProps {
  namespace: string | null
  type: string
  id: string | null
  parsed: any
  parent: ContextTreeProps | null
}

export class LayoutManager {
  #contextManager: ContextManager
  #layoutManager: BosComponent
  #contextElement: Element
  #insPointElement: Element
  #userLinks: Map<UserLinkId, BosUserLink & { isSuitable: boolean }> = new Map()
  #apps: Map<AppId, AppMetadata> = new Map()
  #isEditMode: boolean
  #components = new Map<React.FC<unknown>, InjectableTarget>()

  constructor(
    layoutManager: BosComponent,
    contextElement: Element,
    insPointElement: Element,
    contextManager: ContextManager
  ) {
    this.#layoutManager = layoutManager
    this.#contextElement = contextElement
    this.#insPointElement = insPointElement
    this.#contextManager = contextManager
    this.#isEditMode = false
    this.forceUpdate()
  }

  addUserLink(userLink: BosUserLink, isSuitable: boolean) {
    this.#userLinks.set(userLink.id, { ...userLink, isSuitable })
    this.forceUpdate()
  }

  removeUserLink(userLinkId: UserLinkId) {
    this.#userLinks.delete(userLinkId)
    this.forceUpdate()
  }

  addAppMetadata(appMetadata: AppMetadata) {
    this.#apps.set(appMetadata.id, appMetadata)
    this.forceUpdate()
  }

  removeAppMetadata(globalAppId: AppId) {
    this.#apps.delete(globalAppId)
    this.forceUpdate()
  }

  enableEditMode() {
    this.#isEditMode = true
    this.forceUpdate()
  }

  disableEditMode() {
    this.#isEditMode = false
    this.forceUpdate()
  }

  setRedirectMap(redirectMap: any) {
    this.#layoutManager.redirectMap = redirectMap
  }

  forceUpdate() {
    const context = this.#contextManager.context
    const links = Array.from(this.#userLinks.values())
    const apps = Array.from(this.#apps.values())
    const pureContextTree = LayoutManager._buildContextTree(context)
    const components = Array.from(this.#components.entries()).map(([component, target]) => ({
      component,
      target,
    }))

    this._setProps({
      // ToDo: unify context forwarding
      context: pureContextTree,
      apps: apps.map((app) => ({
        id: app.id,
        metadata: app.metadata,
      })),
      widgets: links.map((link) => ({
        linkId: link.id,
        linkAuthorId: link.authorId,
        src: link.bosWidgetId,
        props: {
          context: pureContextTree,
          link: {
            id: link.id,
            authorId: link.authorId,
          },
        }, // ToDo: add props
        isSuitable: link.isSuitable, // ToDo: LM know about widgets from other LM
      })),
      components: components,
      isEditMode: this.#isEditMode,

      // ToDo: move functions to separate api namespace?
      createUserLink: this._createUserLink.bind(this),
      deleteUserLink: this._deleteUserLink.bind(this),
      enableEditMode: this._enableEditMode.bind(this),
      disableEditMode: this._disableEditMode.bind(this),

      // For OverlayTrigger
      attachContextRef: this._attachContextRef.bind(this),
      attachInsPointRef: this._attachInsPointRef.bind(this),
    })
  }

  injectComponent<T>(target: InjectableTarget, cmp: React.FC<T>) {
    this.#components.set(cmp as React.FC<unknown>, target)
    this.forceUpdate()
  }

  unjectComponent<T>(_: InjectableTarget, cmp: React.FC<T>) {
    this.#components.delete(cmp as React.FC<unknown>)
    this.forceUpdate()
  }

  destroy() {
    this.#components.clear()
    this.#layoutManager.disconnectedCallback?.() // ToDo: it should be called automatically
    this.#layoutManager.remove()
  }

  _setProps(props: LayoutManagerProps) {
    this.#layoutManager.props = props
  }

  // Widget API methods

  async _createUserLink(globalAppId: string): Promise<void> {
    return this.#contextManager.createUserLink(globalAppId)
  }

  _deleteUserLink(userLinkId: UserLinkId) {
    const userLink = this.#userLinks.get(userLinkId)
    if (!userLink) {
      throw new Error(`User link ${userLinkId} not found`)
    }
    return this.#contextManager.deleteUserLink(userLink)
  }

  _enableEditMode() {
    return this.#contextManager.enableEditMode()
  }

  _disableEditMode() {
    return this.#contextManager.disableEditMode()
  }

  _attachContextRef(callback: (r: React.Component | Element | null | undefined) => void) {
    callback(this.#contextElement)
  }

  _attachInsPointRef(callback: (r: React.Component | Element | null | undefined) => void) {
    callback(this.#insPointElement)
  }

  // Utils

  // ToDo: maybe it's better to rename props in IContextNode?
  static _buildContextTree(context: IContextNode): ContextTreeProps {
    return {
      namespace: context.namespace,
      type: context.contextType,
      id: context.id,
      parsed: context.parsedContext,
      parent: context.parentNode ? this._buildContextTree(context.parentNode) : null,
    }
  }
}
