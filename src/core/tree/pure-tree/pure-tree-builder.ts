import { DappletsEngineNs } from '../../constants'
import { EventEmitter } from '../../event-emitter'
import { isDeepEqual } from '../../utils'
import { IContextNode, ITreeBuilder, ParsedContext } from '../types'
import { PureContextNode } from './pure-context-node'

export type TreeBuilderEvents = {
  contextStarted: { context: IContextNode }
  contextFinished: { context: IContextNode }
  contextChanged: { context: IContextNode; previousContext: ParsedContext }
  insertionPointStarted: { context: IContextNode; insertionPoint: string }
  insertionPointFinished: { context: IContextNode; insertionPoint: string }
}

export class PureTreeBuilder implements ITreeBuilder {
  root: IContextNode // ToDo: replace with Root Adapter

  constructor(private _eventEmitter: EventEmitter<TreeBuilderEvents>) {
    // ToDo: move to engine, it's not a core responsibility
    this.root = this.createNode(DappletsEngineNs, 'website') // default ns
  }

  appendChild(parent: IContextNode, child: IContextNode): void {
    parent.appendChild(child)
    this._emitContextStarted(child)
    child.insPoints?.forEach((ip) => this._emitInsPointStarted(child, ip))
  }

  removeChild(parent: IContextNode, child: IContextNode): void {
    parent.removeChild(child)
    this._emitContextFinished(child)
    child.insPoints?.forEach((ip) => this._emitInsPointFinished(child, ip))
  }

  createNode(
    namespace: string,
    contextType: string,
    parsedContext: any = {},
    insPoints: string[] = []
  ): IContextNode {
    return new PureContextNode(namespace, contextType, parsedContext, insPoints)
  }

  updateParsedContext(context: IContextNode, newParsedContext: any): void {
    const oldParsedContext = context.parsedContext

    // ToDo: what to do with contexts without IDs?

    if (oldParsedContext?.id !== newParsedContext?.id) {
      this._emitContextFinished(context)
      context.parsedContext = newParsedContext
      context.id = newParsedContext.id
      this._emitContextStarted(context)
    } else if (!isDeepEqual(oldParsedContext, newParsedContext)) {
      context.parsedContext = newParsedContext
      this._emitContextChanged(context, oldParsedContext)
    }
  }

  updateInsertionPoints(context: IContextNode, foundIPs: string[]): void {
    // IPs means insertion points
    const existingIPs = context.insPoints ?? []
    context.insPoints = foundIPs

    const oldIPs = existingIPs.filter((ip) => !foundIPs.includes(ip))
    const newIPs = foundIPs.filter((ip) => !existingIPs.includes(ip))

    oldIPs.forEach((ip) => this._emitInsPointFinished(context, ip))
    newIPs.forEach((ip) => this._emitInsPointStarted(context, ip))
  }

  clear() {
    // ToDo: move to engine, it's not a core responsibility
    this.root = this.createNode(DappletsEngineNs, 'website') // default ns
  }

  private _emitContextStarted(context: IContextNode) {
    this._eventEmitter.emit('contextStarted', { context })
  }

  private _emitContextChanged(context: IContextNode, previousContext: ParsedContext) {
    this._eventEmitter.emit('contextChanged', { context, previousContext })
  }

  private _emitContextFinished(context: IContextNode) {
    this._eventEmitter.emit('contextFinished', { context })
  }

  private _emitInsPointStarted(context: IContextNode, insertionPoint: string) {
    this._eventEmitter.emit('insertionPointStarted', {
      context,
      insertionPoint,
    })
  }

  private _emitInsPointFinished(context: IContextNode, insertionPoint: string) {
    this._eventEmitter.emit('insertionPointFinished', {
      context,
      insertionPoint,
    })
  }
}
