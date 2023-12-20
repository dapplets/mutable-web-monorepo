import { DynamicHtmlAdapter } from "./dynamic-html-adapter";
import { IAdapter } from "./interface";

export type JsonAdapterConfig = {
  namespace: string;
  parserConfig: ParserConfig;
};

export type ParserConfig = {
  context: {
    selector?: string;
    name: string;
    props?: {
      [key: string]: string;
    };
  };
  children?: ParserConfig[];
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
  config: ParserConfig;

  constructor(
    element: Element,
    document: Document,
    namespace: string,
    config: ParserConfig
  ) {
    super(element, document, namespace, config.context.name);
    this.config = config;
  }

  parseContext() {
    for (const prop in this.config.context.props) {
      const cssOrXpathQuery = this.config.context.props[prop];
      const value = query(cssOrXpathQuery, this.element);

      if (value !== null) {
        // ToDo: add type casting
        this.context.setAttributeNS(this.namespace, prop, value.toString());
      } else {
        this.context.removeAttributeNS(this.namespace, prop);
      }
    }
  }

  findChildElements() {
    const result: Element[] = [];

    for (const childConfig of this.config.children ?? []) {
      if (!childConfig.context.selector) continue;

      const found = Array.from(
        this.element.querySelectorAll(childConfig.context.selector)
      );

      result.push(...found);
    }

    return result;
  }

  createChildAdapter(element: Element) {
    for (const childConfig of this.config.children ?? []) {
      if (!childConfig.context.selector) continue;

      // ToDo: avoid double querySelectorAll
      const found = new WeakSet(
        Array.from(this.element.querySelectorAll(childConfig.context.selector))
      );

      if (found.has(element)) {
        return new JsonAdapter(
          element,
          this.document,
          this.namespace,
          childConfig
        );
      }
    }
  }
}
