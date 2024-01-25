import { DappletsEngineNs } from "../../../constants";
import { isDeepEqual } from "../../utils";
import { IContextListener, IContextNode, ITreeBuilder } from "../types";
import { PureContextNode } from "./pure-context-node";

export class PureTreeBuilder implements ITreeBuilder {
  root: IContextNode;

  #contextListener: IContextListener;

  constructor(contextListener: IContextListener) {
    // ToDo: move to engine, it's not a core responsibility
    this.root = this.createNode(DappletsEngineNs, "website"); // default ns
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

    if (oldParsedContext?.id !== newParsedContext?.id) {
      this.#contextListener.handleContextFinished(context);
      context.parsedContext = newParsedContext;
      context.id = newParsedContext.id;
      this.#contextListener.handleContextStarted(context);
    } else if (!isDeepEqual(oldParsedContext, newParsedContext)) {
      context.parsedContext = newParsedContext;
      this.#contextListener.handleContextChanged(context, oldParsedContext);
    }
  }
}
