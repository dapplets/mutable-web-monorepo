import { IParser, InsertionPoint } from "../parsers/interface";
import { IContextNode, ITreeBuilder } from "../tree/types";
import { IAdapter, InsertionType } from "./interface";

export class DynamicHtmlAdapter implements IAdapter {
  protected element: Element;
  protected treeBuilder: ITreeBuilder;
  protected parser: IParser;
  public namespace: string;
  public context: IContextNode;

  #observerByElement: Map<Element, MutationObserver> = new Map();
  #elementByContext: WeakMap<IContextNode, Element> = new WeakMap();
  #contextByElement: Map<Element, IContextNode> = new Map();

  #isStarted = false; // ToDo: find another way to check if adapter is started

  constructor(
    element: Element,
    treeBuilder: ITreeBuilder,
    namespace: string,
    parser: IParser
  ) {
    this.element = element;
    this.treeBuilder = treeBuilder;
    this.namespace = namespace;
    this.parser = parser;
    this.context = this._createContextForElement(element, "root");
  }

  start() {
    this.#observerByElement.forEach((observer, element) => {
      observer.observe(element, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
      });

      // initial parsing without waiting for mutations in the DOM
      this._handleMutations(element, this.#contextByElement.get(element)!);
    });
    this.#isStarted = true;
  }

  stop() {
    this.#isStarted = false;
    this.#observerByElement.forEach((observer) => observer.disconnect());
  }

  injectElement(
    injectingElement: Element,
    context: IContextNode,
    insertionPoint: string | "root",
    insertionType: InsertionType
  ) {
    if (!Object.values(InsertionType).includes(insertionType)) {
      throw new Error(`Unknown insertion type "${insertionType}"`);
    }

    const contextElement = this.#elementByContext.get(context);

    if (!contextElement) {
      throw new Error("Context element not found");
    }

    let insPointElement: Element | null = this.parser.findInsertionPoint(
      contextElement,
      context.tagName,
      insertionPoint
    );

    // ToDo: move to separate adapter?
    // Generic insertion point for "the ear"
    // if (!insPointElement && insertionPoint === "root") {
    //   insPointElement = contextElement;
    // }

    if (!insPointElement) {
      throw new Error(
        `Insertion point "${insertionPoint}" not found in "${context.tagName}" context type for "${insertionType}" insertion type`
      );
    }

    switch (insertionType) {
      case InsertionType.Before:
        insPointElement.before(injectingElement);
        break;
      case InsertionType.After:
        insPointElement.after(injectingElement);
        break;
      case InsertionType.End:
        insPointElement.appendChild(injectingElement);
        break;
      case InsertionType.Begin:
        insPointElement.insertBefore(
          injectingElement,
          insPointElement.firstChild
        );
        break;
      default:
        throw new Error("Unknown insertion type");
    }
  }

  getInsertionPoints(context: IContextNode): InsertionPoint[] {
    const htmlElement = this.#elementByContext.get(context)!;
    if (!htmlElement) return [];
    return this.parser.getInsertionPoints(htmlElement, context.tagName);
  }

  _createContextForElement(
    element: Element,
    contextName: string
  ): IContextNode {
    const context = this.treeBuilder.createNode(
      this.namespace,
      contextName
    ) as IContextNode;

    const observer = new MutationObserver(() =>
      this._handleMutations(element, context)
    );

    this.#observerByElement.set(element, observer);
    this.#elementByContext.set(context, element);
    this.#contextByElement.set(element, context);

    // ToDo: duplicate code
    if (this.#isStarted) {
      observer.observe(element, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return context;
  }

  private _handleMutations(element: Element, context: IContextNode) {
    const parsedContext = this.parser.parseContext(element, context.tagName);
    const pairs = this.parser.findChildElements(element, context.tagName);
    const insPoints = this._findAvailableInsPoints(element, context.tagName);

    this.treeBuilder.updateParsedContext(context, parsedContext);
    this.treeBuilder.updateInsertionPoints(context, insPoints);
    this._appendNewChildContexts(pairs, context);
    this._removeOldChildContexts(pairs, context);
  }

  private _appendNewChildContexts(
    childPairs: { element: Element; contextName: string }[],
    parentContext: IContextNode
  ) {
    for (const { element, contextName } of childPairs) {
      if (!this.#contextByElement.has(element)) {
        const childContext = this._createContextForElement(
          element,
          contextName
        );
        this.treeBuilder.appendChild(parentContext, childContext);
        this.#contextByElement.set(element, childContext);
      }
    }
  }

  private _removeOldChildContexts(
    childPairs: { element: Element; contextName: string }[],
    parentContext: IContextNode
  ) {
    const childElementsSet = new Set(childPairs.map((pair) => pair.element));
    for (const [element, context] of this.#contextByElement) {
      if (
        !childElementsSet.has(element) &&
        context.parentNode === parentContext
      ) {
        this.treeBuilder.removeChild(parentContext, context);
        this.#contextByElement.delete(element);
        this.#observerByElement.get(element)?.disconnect();
        this.#observerByElement.delete(element);
      }
    }
  }

  // ToDo: move to parser?
  private _findAvailableInsPoints(
    element: Element,
    contextName: string
  ): string[] {
    const parser = this.parser;
    const definedInsPoints = parser.getInsertionPoints(element, contextName);

    const availableInsPoints = definedInsPoints
      .filter((ip) => !!parser.findInsertionPoint(element, contextName, ip.name))
      .map((ip) => ip.name);

    return availableInsPoints;
  }
}
