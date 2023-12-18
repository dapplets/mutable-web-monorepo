import { ContextNode } from "../context-node";

export interface IAdapter {
  root: ContextNode;
  start(): void;
  stop(): void;
}
