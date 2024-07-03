import { IParser } from '../parsers/interface'
import { IContextNode, ITreeBuilder, InsertionPointWithElement } from '../tree/types'
import { IAdapter } from './interface'

export class DynamicHtmlAdapter implements IAdapter {
  protected element: HTMLElement
  protected treeBuilder: ITreeBuilder
  protected parser: IParser
  public namespace: string
  public context: IContextNode

  #observerByElement: Map<HTMLElement, MutationObserver> = new Map()
  #elementByContext: WeakMap<IContextNode, HTMLElement> = new WeakMap()
  #contextByElement: Map<HTMLElement, IContextNode> = new Map()

  #isStarted = false // ToDo: find another way to check if adapter is started

  constructor(element: HTMLElement, treeBuilder: ITreeBuilder, namespace: string, parser: IParser) {
    this.element = element
    this.treeBuilder = treeBuilder
    this.namespace = namespace
    this.parser = parser

    // Namespace is used as ID for the root context
    this.context = this._tryCreateContextForElement(element, 'root', this.namespace)
  }

  start() {
    this.#observerByElement.forEach((observer, element) => {
      observer.observe(element, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
      })

      // initial parsing without waiting for mutations in the DOM
      this._handleMutations(element, this.#contextByElement.get(element)!)
    })
    this.#isStarted = true
  }

  stop() {
    this.#isStarted = false
    this.#observerByElement.forEach((observer) => observer.disconnect())
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

    const observer = new MutationObserver(() => this._handleMutations(element, context))

    this.#observerByElement.set(element, observer)
    this.#elementByContext.set(context, element)
    this.#contextByElement.set(element, context)

    // ToDo: duplicate code
    if (this.#isStarted) {
      observer.observe(element, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
      })
    }

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

        this.#contextByElement.set(element, childContext)
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
        this.#observerByElement.get(element)?.disconnect()
        this.#observerByElement.delete(element)
      }
    }
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
