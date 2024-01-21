import { InsertionType } from "../adapters/interface";
import { IParser, InsertionPoint } from "./interface";
import { render } from "mustache";

const CompAttr = "data-component";
const PropsAttr = "data-props";

export type BosParserConfig = {
  namespace: string;
  contexts: {
    [name: string]: {
      component?: string;
      props?: {
        [prop: string]: string;
      };
      insertionPoints?: {
        [insPointName: string]: {
          component?: string;
          bosLayoutManager?: string;
          insertionType?: InsertionType;
        };
      };
      children?: string[];
    };
  };
};

export class BosParser implements IParser {
  protected config: BosParserConfig;

  constructor(config: BosParserConfig) {
    // ToDo: validate config
    this.config = config;

    if (!this.config.contexts["root"]) {
      this.config.contexts["root"] = {
        props: {
          id: "root",
        },
        children: ["post"], // ToDo:
      };
    }
  }

  parseContext(element: Element, contextName: string) {
    const contextProperties = this.config.contexts[contextName].props;
    if (!contextProperties) return {};

    const parsed: any = {};
    const bosProps = JSON.parse(element.getAttribute(PropsAttr) ?? "{}");

    for (const [prop, mustacheTemplate] of Object.entries(contextProperties)) {
      const value = render(mustacheTemplate, { props: bosProps });
      parsed[prop] = value;
    }

    return parsed;
  }

  findChildElements(element: Element, contextName: string) {
    const contextConfig = this.config.contexts[contextName];
    if (!contextConfig.children?.length) return [];

    const result: { element: Element; contextName: string }[] = [];

    for (const childContextName of contextConfig.children ?? []) {
      const childConfig = this.config.contexts[childContextName];
      if (!childConfig.component) continue;

      const childElements = Array.from(
        element.querySelectorAll(`[${CompAttr}="${childConfig.component}"]`)
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
    const contextConfig = this.config.contexts[contextName];
    const insPointConfig = contextConfig.insertionPoints?.[insertionPoint];

    if (insPointConfig?.component) {
      return element.querySelector(
        `[${CompAttr}="${insPointConfig.component}"]`
      );
    } else {
      return null;
    }
  }

  getInsertionPoints(_: Element, contextName: string): InsertionPoint[] {
    const contextConfig = this.config.contexts[contextName];
    if (!contextConfig.insertionPoints) return [];

    return Object.entries(contextConfig.insertionPoints).map(
      ([name, selectorOrObject]) => ({
        name,
        insertionType: selectorOrObject.insertionType,
        bosLayoutManager: selectorOrObject.bosLayoutManager,
      })
    );
  }
}
