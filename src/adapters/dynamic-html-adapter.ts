import { Context } from "../types";
import { IAdapter } from "./interface";

export abstract class DynamicHtmlAdapter implements IAdapter {
  protected element: Element;
  protected document: Document;
  protected namespace: string;
  public context: Context;

  #observerByElement: Map<Element, MutationObserver> = new Map();
  #elementByContext: WeakMap<Context, Element> = new WeakMap();
  #contextByElement: Map<Element, Context> = new Map();

  constructor(element: Element, document: Document, namespace: string) {
    this.element = element;
    this.document = document;
    this.namespace = namespace;
    this.context = this._createContextForElement(element, "root");
  }

  start() {
    this.#observerByElement.forEach((observer, element) =>
      observer.observe(element, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
      })
    );
  }

  stop() {
    this.#observerByElement.forEach((observer) => observer.disconnect());
  }

  abstract parseContext(
    element: Element,
    contextName: string
  ): [string, string | null][];

  abstract findChildElements(
    element: Element,
    contextName: string
  ): { element: Element; contextName: string }[];

  _createContextForElement(element: Element, contextName: string) {
    const context = this.document.createElementNS(this.namespace, contextName);
    this.#elementByContext.set(context, element);

    const mutationHandler = () => {
      // abstract methods that implemented in adapter classes
      const records = this.parseContext(element, context.tagName);
      const pairs = this.findChildElements(element, context.tagName);
      
      this._updateContext(records, context);
      this._appendNewChildContexts(pairs, context);
      this._removeOldChildContexts(pairs, context);
    };

    const observer = new MutationObserver(mutationHandler);

    this.#observerByElement.set(element, observer);

    return context;
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
    const childElementsSet = new Set(childPairs.map((el) => el.element));
    for (const [el, ctx] of this.#contextByElement) {
      if (!childElementsSet.has(el)) {
        parentContext.removeChild(ctx);
        this.#contextByElement.delete(el);
        this.#observerByElement.get(el)?.disconnect();
        this.#observerByElement.delete(el);
      }
    }
  }
}
