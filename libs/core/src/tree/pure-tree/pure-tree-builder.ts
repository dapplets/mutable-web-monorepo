import { DappletsEngineNs } from '../../constants'
import { isDeepEqual } from '../../utils'
import {
  ContextLevel,
  IContextNode,
  ITreeBuilder,
  InsertionPointWithElement,
  ParsedContext,
} from '../types'
import { PureContextNode } from './pure-context-node'

export type TreeBuilderEvents = {
  contextStarted: { context: IContextNode }
  contextFinished: { context: IContextNode }
  contextChanged: { context: IContextNode; previousContext: ParsedContext }
  insertionPointStarted: { context: IContextNode; insertionPoint: InsertionPointWithElement }
  insertionPointFinished: { context: IContextNode; insertionPoint: InsertionPointWithElement }
}

export class PureTreeBuilder implements ITreeBuilder {
  root: IContextNode // ToDo: replace with Root Adapter

  constructor() {
    // ToDo: move to engine, it's not a core responsibility
    this.root = this.createNode(DappletsEngineNs, 'website', {
      id: window.location.hostname,
    }) // default ns
  }

  appendChild(parent: IContextNode, child: IContextNode): void {
    parent.appendChild(child)
  }

  removeChild(parent: IContextNode, child: IContextNode): void {
    parent.removeChild(child)
  }

  createNode(
    namespace: string,
    contextType: string,
    parsedContext: any = {},
    insPoints: InsertionPointWithElement[] = [],
    element: HTMLElement | null = null
  ): IContextNode {
    return new PureContextNode(
      namespace,
      contextType,
      parsedContext,
      insPoints,
      element,
      (element?.getAttribute('data-mweb-context-level') || 'default') as ContextLevel // ToDo: hardcoded
    )
  }

  updateParsedContext(context: IContextNode, newParsedContext: any): void {
    const oldParsedContext = context.parsedContext

    // ToDo: what to do with contexts without IDs?

    if (oldParsedContext?.id !== newParsedContext?.id) {
      // ToDo: remove child?
      context.parsedContext = newParsedContext
      context.id = newParsedContext.id
    } else if (!isDeepEqual(oldParsedContext, newParsedContext)) {
      context.parsedContext = newParsedContext
    }
  }

  updateInsertionPoints(context: IContextNode, foundIPs: InsertionPointWithElement[]): void {
    // IPs means insertion points
    const existingIPs = context.insPoints ?? []

    const oldIPs = existingIPs.filter((ip) => !foundIPs.some((_ip) => _ip.name === ip.name))
    const newIPs = foundIPs.filter((ip) => !existingIPs.some((_ip) => _ip.name === ip.name))

    // Remove old IPs from context.insPoints
    oldIPs.forEach((ip) => {
      context.removeInsPoint(ip.name)
    })

    // Add new IPs to context.insPoints
    newIPs.forEach((ip) => {
      context.appendInsPoint(ip)
    })
  }

  updateVisibility(context: IContextNode, isVisible: boolean): void {
    if (context.isVisible !== isVisible) {
      context.isVisible = isVisible
    }
  }

  clear() {
    // ToDo: move to engine, it's not a core responsibility
    this.root = this.createNode(DappletsEngineNs, 'website') // default ns
  }
}
