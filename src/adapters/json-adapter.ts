import { ParsedContext } from "../context-node";
import { DynamicHtmlAdapter } from "./dynamic-html-adapter";
import { IAdapter } from "./interface";

export type AdapterConfig = {
  context: {
    selector?: string;
    type: string;
    props?: {
      [key: string]: string;
    };
  };
  children?: AdapterConfig[];
};

const query = (cssOrXPath: string, element: Element) => {
  try {
    const result = element.querySelector(cssOrXPath);
    if (result) return result.textContent;
  } catch (_) {}

  try {
    // ToDo: replace with document.createExpression ?
    const result = element.ownerDocument.evaluate(cssOrXPath, element, null, 0);

    switch (result.resultType) {
      case XPathResult.NUMBER_TYPE:
        return result.numberValue;
      case XPathResult.STRING_TYPE:
        return result.stringValue;
      case XPathResult.BOOLEAN_TYPE:
        return result.booleanValue;
      default:
        return null; // ToDo: or undefined?
    }
  } catch (_) {
    console.error(_);
  }

  return null;
};

export class JsonAdapter extends DynamicHtmlAdapter implements IAdapter {
  #config: AdapterConfig;

  constructor(element: Element, config: AdapterConfig) {
    super(element, config.context.type);
    this.#config = config;
  }

  parseContext() {
    const result: ParsedContext = {};

    for (const prop in this.#config.context.props) {
      const cssOrXpathQuery = this.#config.context.props[prop];
      result[prop] = query(cssOrXpathQuery, this.element);
    }

    return result;
  }

  findChildElements() {
    const result: Element[] = [];

    for (const childConfig of this.#config.children ?? []) {
      if (!childConfig.context.selector) continue;

      const found = Array.from(
        this.element.querySelectorAll(childConfig.context.selector)
      );

      result.push(...found);
    }

    return result;
  }

  createChildAdapter(element: Element) {
    for (const childConfig of this.#config.children ?? []) {
      if (!childConfig.context.selector) continue;

      // ToDo: avoid double querySelectorAll
      const found = new WeakSet(
        Array.from(this.element.querySelectorAll(childConfig.context.selector))
      );

      if (found.has(element)) {
        return new JsonAdapter(element, childConfig);
      }
    }
  }
}
