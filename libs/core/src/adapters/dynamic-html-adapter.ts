import { IParser } from '../parsers/interface'
import { IContextNode, ITreeBuilder, InsertionPointWithElement } from '../tree/types'
import { IAdapter } from './interface'

const ShadowHostAttr = 'data-mweb-shadow-host'

export class DynamicHtmlAdapter implements IAdapter {
  protected element: HTMLElement
  protected treeBuilder: ITreeBuilder
  protected parser: IParser
  public namespace: string
  public context: IContextNode

  #mutationObserverByElement: Map<HTMLElement, MutationObserver> = new Map()
  #intersectionObserverByElement: Map<HTMLElement, IntersectionObserver> = new Map()
  #contextByElement: Map<HTMLElement, IContextNode> = new Map()

  #isStarted = false // ToDo: find another way to check if adapter is started

  constructor(element: HTMLElement, treeBuilder: ITreeBuilder, namespace: string, parser: IParser) {
    this.element = element
    this.treeBuilder = treeBuilder
    this.namespace = namespace
    this.parser = parser

    // Namespace is used as ID for the root context
    this.context = this._tryCreateContextForElement(element, 'root', 'global')
  }

  start() {
    this.#mutationObserverByElement.forEach((observer, element) => {
      observer.observe(element, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
      })

      // initial parsing without waiting for mutations in the DOM
      this._handleMutations(element, this.#contextByElement.get(element)!)
    })

    this.#intersectionObserverByElement.forEach((observer, element) => {
      observer.observe(element)
    })

    this.#isStarted = true
  }

  stop() {
    this.#isStarted = false
    this.#mutationObserverByElement.forEach((observer) => observer.disconnect())
    this.#intersectionObserverByElement.forEach((observer) => observer.disconnect())
  }

  _tryCreateContextForElement(element: HTMLElement, contextName: string): IContextNode | null
  _tryCreateContextForElement(
    element: HTMLElement,
    contextName: string,
    defaultContextId: string
  ): IContextNode
  _tryCreateContextForElement(
    element: HTMLElement,
    contextName: string,
    defaultContextId?: string
  ): IContextNode | null {
    const parsedContext = this.parser.parseContext(element, contextName)

    if (!parsedContext.id) {
      if (!defaultContextId) {
        return null
      } else {
        parsedContext.id = defaultContextId
      }
    }

    const insPoints = this._findAvailableInsPoints(element, contextName)
    const context = this.treeBuilder.createNode(
      this.namespace,
      contextName,
      parsedContext,
      insPoints,
      element
    )

    const mutationObserver = new MutationObserver((mutations, observer) => {
      this._handleMutations(element, context)

      if (this.parser.shouldParseShadowDom) {
        this._observeShadowRoots(mutations, observer)
      }
    })

    this.#mutationObserverByElement.set(element, mutationObserver)

    // ToDo: duplicate code
    if (this.#isStarted) {
      mutationObserver.observe(element, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
      })
    }

    // Only L2 contexts
    if (element !== this.element) {
      const intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          this.treeBuilder.updateVisibility(context, entry.isIntersecting)
        },
        {
          threshold: 1, // isIntersecting is true when 100% of the context element is in viewport
        }
      )

      this.#intersectionObserverByElement.set(element, intersectionObserver)

      // ToDo: duplicate code
      if (this.#isStarted) {
        intersectionObserver.observe(element)
      }
    }

    this.#contextByElement.set(element, context)

    return context
  }

  private _handleMutations(element: HTMLElement, context: IContextNode) {
    const parsedContext = this.parser.parseContext(element, context.contextType)
    const pairs = this.parser.findChildElements(element, context.contextType)
    const insPoints = this._findAvailableInsPoints(element, context.contextType)

    this.treeBuilder.updateParsedContext(context, parsedContext)
    this.treeBuilder.updateInsertionPoints(context, insPoints)
    this._removeOldChildContexts(pairs, context)
    this._appendNewChildContexts(pairs, context)

    // ToDo: add warning about similar contexts
  }

  private _appendNewChildContexts(
    childPairs: { element: HTMLElement; contextName: string }[],
    parentContext: IContextNode
  ) {
    for (const { element, contextName } of childPairs) {
      if (!this.#contextByElement.has(element)) {
        const childContext = this._tryCreateContextForElement(element, contextName)

        if (!childContext) {
          continue
        }

        this.treeBuilder.appendChild(parentContext, childContext)

        // initial parsing
        this._handleMutations(element, childContext)
      }
    }
  }

  private _removeOldChildContexts(
    childPairs: { element: HTMLElement; contextName: string }[],
    parentContext: IContextNode
  ) {
    const childElementsSet = new Set(childPairs.map((pair) => pair.element))
    for (const [element, context] of this.#contextByElement) {
      if (!childElementsSet.has(element) && context.parentNode === parentContext) {
        this.treeBuilder.removeChild(parentContext, context)
        this.#contextByElement.delete(element)
        this.#mutationObserverByElement.get(element)?.disconnect()
        this.#mutationObserverByElement.delete(element)
        this.#intersectionObserverByElement.get(element)?.disconnect()
        this.#intersectionObserverByElement.delete(element)
      }
    }
  }

  private _observeShadowRoots(mutations: MutationRecord[], observer: MutationObserver) {
    mutations.forEach((mutation) => {
      if (mutation.type !== 'childList') return

      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return
        if (!(node instanceof Element)) return
        if (!node.shadowRoot) return
        if (!node.hasAttribute(ShadowHostAttr)) return // ToDo: it's mweb-parser specific logic

        // ToDo: the similar logic as in _tryCreateContextForElement
        observer.observe(node.shadowRoot, {
          attributes: true,
          childList: true,
          subtree: true,
          characterData: true,
        })
      })
    })
  }

  // ToDo: move to parser?
  private _findAvailableInsPoints(
    element: HTMLElement,
    contextName: string
  ): InsertionPointWithElement[] {
    const parser = this.parser
    const definedInsPoints = parser.getInsertionPoints(element, contextName)

    const availableInsPoints = definedInsPoints
      .map((ip) => ({
        ...ip,
        element: parser.findInsertionPoint(element, contextName, ip.name),
      }))
      .filter((ip) => !!ip.element) as InsertionPointWithElement[]

    return availableInsPoints
  }
}
