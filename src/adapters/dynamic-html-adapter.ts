import { Context } from "../types";
import { IAdapter } from "./interface";

export abstract class DynamicHtmlAdapter implements IAdapter {
  protected element: Element;
  protected document: Document;
  protected namespace: string;
  public context: Context;

  #observer: MutationObserver;
  #children: Map<Element, DynamicHtmlAdapter> = new Map();

  constructor(
    element: Element,
    document: Document,
    namespace: string,
    name: string
  ) {
    this.element = element;
    this.document = document;
    this.namespace = namespace;
    this.context = document.createElementNS(namespace, name);
    this.#observer = new MutationObserver(this._handleMutations.bind(this));
  }

  start() {
    this.#children.forEach((adapter) => adapter.start());
    this.#observer.observe(this.element, {
      attributes: true,
      childList: true,
      subtree: true,
    });
    this._handleMutations([]);
  }

  stop() {
    this.#children.forEach((adapter) => adapter.stop());
    this.#observer.disconnect();
  }

  abstract parseContext(): void;
  abstract findChildElements(): Element[];
  abstract createChildAdapter(element: Element): DynamicHtmlAdapter | undefined;

  private _handleMutations(mutations: MutationRecord[]) {
    // parse and update props
    this.parseContext();

    // update children contexts
    const childElements = new Set(this.findChildElements());

    for (const el of childElements) {
      if (!this.#children.has(el)) {
        const adapter = this.createChildAdapter(el);
        if (!adapter) {
          console.error("Adapter not found for element", el);
          continue;
        }
        this.#children.set(el, adapter);
        this.context.appendChild(adapter.context);
        adapter.start();
      }
    }

    // remove children that are no longer in the DOM
    for (const [element, adapter] of this.#children) {
      if (!childElements.has(element)) {
        this.context.removeChild(adapter.context);
        adapter.stop();
        this.#children.delete(element);
      }
    }
  }
}
