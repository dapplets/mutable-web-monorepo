import { DappletsEngineNs } from '../../../constants'
import { isDeepEqual } from '../../utils'
import { IContextListener, IContextNode, ITreeBuilder } from '../types'
import { PureContextNode } from './pure-context-node'

export class PureTreeBuilder implements ITreeBuilder {
  root: IContextNode

  #listeners: IContextListener

  constructor(contextListener: IContextListener) {
    // ToDo: move to engine, it's not a core responsibility
    this.root = this.createNode(DappletsEngineNs, 'website') // default ns
    this.#listeners = contextListener
  }

  appendChild(parent: IContextNode, child: IContextNode): void {
    parent.appendChild(child)
    this.#listeners.handleContextStarted(child)
    child.insPoints?.forEach((ip) => this.#listeners.handleInsPointStarted(child, ip))
  }

  removeChild(parent: IContextNode, child: IContextNode): void {
    parent.removeChild(child)
    this.#listeners.handleContextFinished(child)
    child.insPoints?.forEach((ip) => this.#listeners.handleInsPointFinished(child, ip))
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
      this.#listeners.handleContextFinished(context)
      context.parsedContext = newParsedContext
      context.id = newParsedContext.id
      this.#listeners.handleContextStarted(context)
    } else if (!isDeepEqual(oldParsedContext, newParsedContext)) {
      context.parsedContext = newParsedContext
      this.#listeners.handleContextChanged(context, oldParsedContext)
    }
  }

  updateInsertionPoints(context: IContextNode, foundIPs: string[]): void {
    // IPs means insertion points
    const existingIPs = context.insPoints ?? []
    context.insPoints = foundIPs

    const oldIPs = existingIPs.filter((ip) => !foundIPs.includes(ip))
    const newIPs = foundIPs.filter((ip) => !existingIPs.includes(ip))

    oldIPs.forEach((ip) => this.#listeners.handleInsPointFinished(context, ip))
    newIPs.forEach((ip) => this.#listeners.handleInsPointStarted(context, ip))
  }
}
