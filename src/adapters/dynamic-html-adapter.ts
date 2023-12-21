import { IParser } from "../parsers/interface";
import { Context } from "../types";
import { IAdapter } from "./interface";

export class DynamicHtmlAdapter implements IAdapter {
  protected element: Element;
  protected document: Document;
  protected namespace: string;
  protected adapter: IParser;
  public context: Context;

  #observerByElement: Map<Element, MutationObserver> = new Map();
  #elementByContext: WeakMap<Context, Element> = new WeakMap();
  #contextByElement: Map<Element, Context> = new Map();

  constructor(
    element: Element,
    document: Document,
    namespace: string,
    adapter: IParser
  ) {
    this.element = element;
    this.document = document;
    this.namespace = namespace;
    this.adapter = adapter;
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
    const records = this.adapter.parseContext(element, context.tagName);
    const pairs = this.adapter.findChildElements(element, context.tagName);

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
