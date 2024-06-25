import { Subscription } from '../event-emitter'
import { InsertionPoint } from '../parsers/interface'

export type TreeNodeEvents = {
  contextChanged: {}
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

export interface IContextNode {
  id: string | null
  contextType: string
  namespace: string
  parentNode: IContextNode | null
  element: HTMLElement | null

  parsedContext: ParsedContext
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
  createNode(
    namespace: string | null,
    contextType: string,
    parsedContext?: any,
    insPoints?: InsertionPointWithElement[],
    element?: HTMLElement
  ): IContextNode
}
