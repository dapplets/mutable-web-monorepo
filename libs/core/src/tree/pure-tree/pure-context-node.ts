import { EventEmitter, Subscription } from '../../event-emitter'
import { ContextLevel, IContextNode, InsertionPointWithElement, TreeNodeEvents } from '../types'

export class PureContextNode implements IContextNode {
  public id: string | null = null
  public contextType: string
  public contextLevel: ContextLevel
  public namespace: string
  public parentNode: IContextNode | null = null
  public children: IContextNode[] = []
  public insPoints: InsertionPointWithElement[] = [] // ToDo: replace with Map
  public element: HTMLElement | null = null

  #parsedContext: any = {}
  #isVisible = false
  #eventEmitter = new EventEmitter<TreeNodeEvents>() // ToDo: implement event bubbling?

  public get parsedContext() {
    return this.#parsedContext
  }

  public set parsedContext(parsedContext: any) {
    this.#parsedContext = parsedContext
    this.#eventEmitter.emit('contextChanged', {})
  }

  public get isVisible() {
    return this.#isVisible
  }

  public set isVisible(value: boolean) {
    this.#isVisible = value
    this.#eventEmitter.emit('visibilityChanged', {})
  }

  constructor(
    namespace: string,
    contextType: string,
    parsedContext: any = {},
    insPoints: InsertionPointWithElement[] = [],
    element: HTMLElement | null = null,
    contextLevel: ContextLevel
  ) {
    this.namespace = namespace
    this.contextType = contextType
    this.parsedContext = parsedContext
    this.insPoints = insPoints
    this.element = element
    this.contextLevel = contextLevel

    // ToDo: the similar logic is in tree builder
    this.id = parsedContext.id ?? null
  }

  removeChild(child: IContextNode): void {
    child.parentNode = null
    this.children = this.children.filter((c) => c !== child)
    this.#eventEmitter.emit('childContextRemoved', { child })

    // ToDo: remove children of removed context?
  }

  appendChild(child: IContextNode): void {
    child.parentNode = this
    this.children.push(child)
    this.#eventEmitter.emit('childContextAdded', { child })
  }

  appendInsPoint(insertionPoint: InsertionPointWithElement): void {
    this.insPoints.push(insertionPoint)
    this.#eventEmitter.emit('insertionPointAdded', { insertionPoint })
  }

  removeInsPoint(insertionPointName: string): void {
    const insPointToRemove = this.insPoints.find((ip) => ip.name === insertionPointName)
    if (!insPointToRemove) return

    this.insPoints = this.insPoints.filter((ip) => ip.name !== insertionPointName)
    this.#eventEmitter.emit('insertionPointRemoved', { insertionPoint: insPointToRemove })
  }

  public on<EventName extends keyof TreeNodeEvents>(
    eventName: EventName,
    callback: (event: TreeNodeEvents[EventName]) => void
  ): Subscription {
    return this.#eventEmitter.on(eventName, callback)
  }
}
