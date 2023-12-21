import { Context } from "../types";

export interface IAdapter {
  context: Context;

  start(): void;
  stop(): void;
}
