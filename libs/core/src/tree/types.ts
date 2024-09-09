import { Subscription } from '../event-emitter'
import { InsertionPoint } from '../parsers/interface'

export type TreeNodeEvents = {
  contextChanged: {}
  visibilityChanged: {}
  childContextAdded: { child: IContextNode }
  childContextRemoved: { child: IContextNode }
  insertionPointAdded: { insertionPoint: InsertionPointWithElement }
  insertionPointRemoved: { insertionPoint: InsertionPointWithElement }
}

export type InsertionPointWithElement = InsertionPoint & {
  element: HTMLElement
}

export type ParsedContext = {
  [key: string]: any
}

export type ContextLevel = 'default' | 'system' | 'callout'

export interface IContextNode {
  id: string | null
  contextType: string // ToDo: rename to type
  contextLevel: ContextLevel
  namespace: string
  parentNode: IContextNode | null // ToDo: rename to parent
  element: HTMLElement | null
  isVisible: boolean

  parsedContext: ParsedContext // ToDo: rename to parsed
  insPoints: InsertionPointWithElement[]
  children: IContextNode[]
  removeChild(child: IContextNode): void
  appendChild(child: IContextNode): void

  appendInsPoint(insPoint: InsertionPointWithElement): void
  removeInsPoint(insPointName: string): void

  on<EventName extends keyof TreeNodeEvents>(
    eventName: EventName,
    callback: (event: TreeNodeEvents[EventName]) => void
  ): Subscription
}

export interface ITreeBuilder {
  root: IContextNode

  appendChild(parent: IContextNode, child: IContextNode): void
  removeChild(parent: IContextNode, child: IContextNode): void
  updateParsedContext(context: IContextNode, parsedContext: any): void
  updateInsertionPoints(context: IContextNode, insPoints: InsertionPointWithElement[]): void
  updateVisibility(context: IContextNode, isVisible: boolean): void
  createNode(
    namespace: string | null,
    contextType: string,
    parsedContext?: any,
    insPoints?: InsertionPointWithElement[],
    element?: HTMLElement
  ): IContextNode
}
