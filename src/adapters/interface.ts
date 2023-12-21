import { Context } from "../types";

export interface IAdapter {
  context: Context;
  start(): void;
  stop(): void;
  // injectElement(element: Element, context: Context, insertionPoint: string): void;
}
