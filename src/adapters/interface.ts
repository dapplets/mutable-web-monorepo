import { Context } from "../types";

export interface IHtmlParser {
  parseContext(
    element: Element,
    contextName: string
  ): [string, string | null][];

  findChildElements(
    element: Element,
    contextName: string
  ): { element: Element; contextName: string }[];

  // injectElement(element: Element, context: Context, insertionPoint: string): void;
}

export interface IAdapter {
  context: Context;

  start(): void;
  stop(): void;
}
