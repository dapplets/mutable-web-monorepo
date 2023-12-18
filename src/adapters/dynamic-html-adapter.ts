import { ContextNode, ParsedContext } from "../context-node";
import { IAdapter } from "./interface";

export abstract class DynamicHtmlAdapter implements IAdapter {
  public root: ContextNode;
  protected element: Element;

  #mutationObserver: MutationObserver;
  #children: Map<Element, DynamicHtmlAdapter> = new Map();

  constructor(element: Element, contextType = "root") {
    this.#mutationObserver = new MutationObserver(
      this._handleMutations.bind(this)
    );
    this.root = new ContextNode(contextType);
    this.element = element;
  }

  start() {
    this.#children.forEach((adapter) => adapter.start());
    this.#mutationObserver.observe(this.element, {
      attributes: true,
      childList: true,
      subtree: true,
    });
    this._handleMutations([]);
  }

  stop() {
    this.#children.forEach((adapter) => adapter.stop());
    this.#mutationObserver.disconnect();
  }

  abstract parseContext(): ParsedContext;
  abstract findChildElements(): Element[];
  abstract createChildAdapter(element: Element): DynamicHtmlAdapter | undefined;

  private _handleMutations(mutations: MutationRecord[]) {
    // parse and update props
    Object.assign(this.root.props, this.parseContext());

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
        this.root.addChild(adapter.root);
        adapter.start();
      }
    }

    // remove children that are no longer in the DOM
    for (const [element, adapter] of this.#children) {
      if (!childElements.has(element)) {
        this.root.removeChild(adapter.root);
        adapter.stop();
        this.#children.delete(element);
      }
    }
  }
}
