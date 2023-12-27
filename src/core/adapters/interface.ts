import { Context } from "../types";

export enum InsertionType {
  Before = "before",
  After = "after",
  Inside = "inside",
}

export interface IAdapter {
  namespace: string;
  context: Context;

  start(): void;
  stop(): void;

  injectElement(
    element: Element,
    context: Context,
    insertionPoint: string,
    insertionType: InsertionType
  ): void;
}
