import { IParser } from "./interface";

export type ParserConfig = {
  namespace: string;
  contexts: {
    [name: string]: {
      selector?: string;
      props?: {
        [prop: string]: string;
      };
      insertionPoints?: {
        [insPointName: string]: string;
      };
      children?: string[];
    };
  };
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

export class JsonParser implements IParser {
  protected config: ParserConfig;

  constructor(config: ParserConfig) {
    // ToDo: validate config
    this.config = config;
  }

  parseContext(element: Element, contextName: string) {
    const contextProperties = this.config.contexts[contextName].props;
    if (!contextProperties) return [];

    const parsed: [string, string | null][] = [];

    for (const [prop, cssOrXpathQuery] of Object.entries(contextProperties)) {
      const value = query(cssOrXpathQuery, element)?.toString() ?? null;
      parsed.push([prop, value]);
    }

    return parsed;
  }

  findChildElements(
    element: Element,
    contextName: string
  ): { element: Element; contextName: string }[] {
    const contextConfig = this.config.contexts[contextName];
    if (!contextConfig.children?.length) return [];

    const result: { element: Element; contextName: string }[] = [];

    for (const childContextName of contextConfig.children ?? []) {
      const childConfig = this.config.contexts[childContextName];
      if (!childConfig.selector) continue;

      const childElements = Array.from(
        element.querySelectorAll(childConfig.selector)
      );

      for (const childElement of childElements) {
        result.push({ element: childElement, contextName: childContextName });
      }
    }

    return result;
  }

  findInsertionPoint(
    element: Element,
    contextName: string,
    insertionPoint: string
  ): Element | null {
    // Generic insertion point for "the ear"
    if (insertionPoint === "root") return element;

    const contextConfig = this.config.contexts[contextName];
    const selector = contextConfig.insertionPoints?.[insertionPoint];
    if (!selector) return null;
    return element.querySelector(selector);
  }
}
