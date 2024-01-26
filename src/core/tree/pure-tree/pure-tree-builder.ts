import { DappletsEngineNs } from "../../../constants";
import { InsertionPoint } from "../../parsers/interface";
import { isDeepEqual } from "../../utils";
import { IContextListener, IContextNode, ITreeBuilder } from "../types";
import { PureContextNode } from "./pure-context-node";

export class PureTreeBuilder implements ITreeBuilder {
  root: IContextNode;

  #listeners: IContextListener;

  constructor(contextListener: IContextListener) {
    // ToDo: move to engine, it's not a core responsibility
    this.root = this.createNode(DappletsEngineNs, "website"); // default ns
    this.#listeners = contextListener;
  }

  appendChild(parent: IContextNode, child: IContextNode): void {
    parent.appendChild(child);
    this.#listeners.handleContextStarted(child);
  }

  removeChild(parent: IContextNode, child: IContextNode): void {
    parent.removeChild(child);
    this.#listeners.handleContextFinished(child);
  }

  createNode(namespaceURI: string | null, tagName: string): IContextNode {
    return new PureContextNode(namespaceURI, tagName);
  }

  updateParsedContext(context: IContextNode, newParsedContext: any): void {
    const oldParsedContext = context.parsedContext;

    if (oldParsedContext?.id !== newParsedContext?.id) {
      this.#listeners.handleContextFinished(context);
      context.parsedContext = newParsedContext;
      context.id = newParsedContext.id;
      this.#listeners.handleContextStarted(context);
    } else if (!isDeepEqual(oldParsedContext, newParsedContext)) {
      context.parsedContext = newParsedContext;
      this.#listeners.handleContextChanged(context, oldParsedContext);
    }
  }

  updateInsertionPoints(context: IContextNode, foundIPs: string[]): void {
    // IPs means insertion points
    const existingIPs = context.insPoints;
    context.insPoints = foundIPs;

    const oldIPs = existingIPs.filter((ip) => !foundIPs.includes(ip));
    const newIPs = foundIPs.filter((ip) => !existingIPs.includes(ip));

    oldIPs.forEach((ip) => this.#listeners.handleInsPointFinished(context, ip));
    newIPs.forEach((ip) => this.#listeners.handleInsPointStarted(context, ip));
  }
}
