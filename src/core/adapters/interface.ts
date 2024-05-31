import { InsertionPoint } from '../parsers/interface'
import { IContextNode } from '../tree/types'

export enum InsertionType {
  Before = 'before',
  After = 'after',
  Begin = 'begin',
  End = 'end',
}

export interface IAdapter {
  namespace: string
  context: IContextNode

  start(): void
  stop(): void

  injectElement(element: HTMLElement, context: IContextNode, insertionPoint: string): void

  getInsertionPoints(context: IContextNode): InsertionPoint[]

  // For OverlayTrigger
  getContextElement(context: IContextNode): HTMLElement | null
  getInsertionPointElement(context: IContextNode, insPointName: string): HTMLElement | null
}
