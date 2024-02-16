// @ts-nocheck

import { IContextListener, IContextNode, ITreeBuilder } from '../types'

export class DomTreeBuilder implements ITreeBuilder {
  root: IContextNode

  #document: XMLDocument
  #contextListener: IContextListener
  #observer: MutationObserver

  constructor(contextListener: IContextListener) {
    this.#contextListener = contextListener
    this.#document = document.implementation.createDocument(null, 'semantictree')
    this.root = this.createNode(null, 'root')
    this.#observer = new MutationObserver(this.#handleMutations.bind(this))
    this.#observer.observe(this.root as Element, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    })
  }

  appendChild(parent: IContextNode, child: IContextNode) {
    parent.appendChild(child)
  }

  removeChild(parent: IContextNode, child: IContextNode) {
    parent.removeChild(child)
  }

  createNode(namespaceURI: string | null, tagName: string): IContextNode {
    return this.#document.createElementNS(namespaceURI, tagName) as IContextNode
  }

  updateParsedContext(context: IContextNode, newParsedContext: any) {
    const oldParsedContext = context.parsedContext

    if (oldParsedContext?.id !== newParsedContext.id) {
      this.#contextListener.handleContextFinished(context)
      context.parsedContext = newParsedContext
      context.id = newParsedContext.id
      this.#contextListener.handleContextStarted(context)
    } else {
      context.parsedContext = newParsedContext
      this.#contextListener.handleContextChanged(context, oldParsedContext)
    }
  }

  /**
   * Returns a serialized XML tree
   * @experimental
   */
  getSerializedXmlTree(): string {
    const serializer = new XMLSerializer()
    return serializer.serializeToString(this.#document)
  }

  #handleMutations(mutations: MutationRecord[]) {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const addedNode of mutation.addedNodes) {
          if (addedNode instanceof Element) {
            this.#contextListener.handleContextStarted(addedNode as IContextNode)
          }
        }
        for (const removedNode of mutation.removedNodes) {
          if (removedNode instanceof Element) {
            this.#contextListener.handleContextFinished(removedNode as IContextNode)
          }
        }
      }
    }
  }
}
