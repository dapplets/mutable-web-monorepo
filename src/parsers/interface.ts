import { Context } from "../types";

export interface IParser {
  parseContext(
    element: Element,
    contextName: string
  ): [string, string | null][];

  findChildElements(
    element: Element,
    contextName: string
  ): { element: Element; contextName: string }[];

  findInsertionPoint(
    element: Element,
    contextName: string,
    insertionPoint: string
  ): Element | null;
}
