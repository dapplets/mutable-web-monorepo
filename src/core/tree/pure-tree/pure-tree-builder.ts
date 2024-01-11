import stringify from "json-stringify-deterministic";
import { IContextListener, IContextNode, ITreeBuilder } from "../types";
import { PureContextNode } from "./pure-context-node";

export class PureTreeBuilder implements ITreeBuilder {
  root: IContextNode;

  #contextListener: IContextListener;

  constructor(contextListener: IContextListener) {
    this.root = this.createNode(null, "root");
    this.#contextListener = contextListener;
  }

  appendChild(parent: IContextNode, child: IContextNode): void {
    parent.appendChild(child);
    this.#contextListener.handleContextStarted(child);
  }

  removeChild(parent: IContextNode, child: IContextNode): void {
    parent.removeChild(child);
    this.#contextListener.handleContextFinished(child);
  }

  createNode(namespaceURI: string | null, tagName: string): IContextNode {
    return new PureContextNode(namespaceURI, tagName);
  }

  updateParsedContext(context: IContextNode, newParsedContext: any) {
    const oldParsedContext = context.parsedContext;

    if (oldParsedContext?.id !== newParsedContext.id) {
      this.#contextListener.handleContextFinished(context);
      context.parsedContext = newParsedContext;
      context.id = newParsedContext.id;
      this.#contextListener.handleContextStarted(context);
    } else if (stringify(oldParsedContext) !== stringify(newParsedContext)) { // deep equal check
      context.parsedContext = newParsedContext;
      this.#contextListener.handleContextChanged(context, oldParsedContext);
    }
  }
}
