import { IParser } from "../parsers/interface";
import { Context } from "../types";
import { IAdapter, InsertionType } from "./interface";

export class DynamicHtmlAdapter implements IAdapter {
  protected element: Element;
  protected document: Document;
  protected namespace: string;
  protected parser: IParser;
  public context: Context;

  #observerByElement: Map<Element, MutationObserver> = new Map();
  #elementByContext: WeakMap<Context, Element> = new WeakMap();
  #contextByElement: Map<Element, Context> = new Map();

  constructor(
    element: Element,
    document: Document,
    namespace: string,
    parser: IParser
  ) {
    this.element = element;
    this.document = document;
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
  }

  stop() {
    this.#observerByElement.forEach((observer) => observer.disconnect());
  }

  injectElement(
    injectingElement: Element,
    context: Context,
    insertionPoint: string,
    insertionType: InsertionType
  ) {
    const contextElement = this.#elementByContext.get(context);

    if (!contextElement) {
      throw new Error("Context element not found");
    }

    const insPointElement = this.parser.findInsertionPoint(
      contextElement,
      context.tagName,
      insertionPoint
    );

    if (!insPointElement) {
      throw new Error("Insertion point not found");
    }

    switch (insertionType) {
      case InsertionType.Before:
        insPointElement.before(injectingElement);
        break;
      case InsertionType.After:
        insPointElement.after(injectingElement);
        break;
      default:
        throw new Error("Unknown insertion type");
    }
  }

  _createContextForElement(element: Element, contextName: string) {
    const context = this.document.createElementNS(this.namespace, contextName);

    const observer = new MutationObserver(() =>
      this._handleMutations(element, context)
    );

    this.#observerByElement.set(element, observer);
    this.#elementByContext.set(context, element);
    this.#contextByElement.set(element, context);

    return context;
  }

  private _handleMutations(element: Element, context: Context) {
    const records = this.parser.parseContext(element, context.tagName);
    const pairs = this.parser.findChildElements(element, context.tagName);

    this._updateContext(records, context);
    this._appendNewChildContexts(pairs, context);
    this._removeOldChildContexts(pairs, context);
  }

  private _updateContext(records: [string, string | null][], context: Context) {
    for (const [prop, value] of records) {
      if (value !== null && value !== undefined) {
        context.setAttributeNS(this.namespace, prop, value);
      } else {
        context.removeAttributeNS(this.namespace, prop);
      }
    }
  }

  private _appendNewChildContexts(
    childPairs: { element: Element; contextName: string }[],
    parentContext: Context
  ) {
    for (const { element, contextName } of childPairs) {
      if (!this.#contextByElement.has(element)) {
        const childContext = this._createContextForElement(
          element,
          contextName
        );
        parentContext.appendChild(childContext);
        this.#contextByElement.set(element, childContext);
      }
    }
  }

  private _removeOldChildContexts(
    childPairs: { element: Element; contextName: string }[],
    parentContext: Context
  ) {
    const childElementsSet = new Set(childPairs.map((pair) => pair.element));
    for (const [element, context] of this.#contextByElement) {
      if (
        !childElementsSet.has(element) &&
        context.parentNode === parentContext
      ) {
        parentContext.removeChild(context);
        this.#contextByElement.delete(element);
        this.#observerByElement.get(element)?.disconnect();
        this.#observerByElement.delete(element);
      }
    }
  }
}
