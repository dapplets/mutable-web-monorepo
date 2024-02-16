import {
  IContextListener,
  IContextNode,
} from "../../../../../src/core/tree/types";
import { DomTreeBuilder } from "../../../../../src/core/tree/dom-tree/dom-tree-builder";
import { PureContextNode } from "../../../../../src/core/tree/pure-tree/pure-context-node";
import { describe, expect, it, beforeEach,jest } from "@jest/globals";

describe("Dom tree builder", () => {
  let ns: string;
  let treeBuilder: DomTreeBuilder;
  let contextNode: IContextNode;
  let contextChildNode: IContextNode;
  let listeners: IContextListener;
  beforeEach(() => {
    ns = "https://dapplets.org/ns/json/some-web-site";
    listeners = {
      handleContextStarted: jest.fn(() => undefined),
      handleContextChanged: jest.fn(() => undefined),
      handleContextFinished: jest.fn(() => undefined),
      handleInsPointStarted: jest.fn(() => undefined),
      handleInsPointFinished: jest.fn(() => undefined),
    };
    contextNode = new PureContextNode(ns, "html");
    contextChildNode = new PureContextNode(ns, "div");
    treeBuilder = new DomTreeBuilder(listeners);
  });

  it("dom tree build append child", () => {
    expect(contextChildNode.parentNode).toBe(null);
    expect(treeBuilder.appendChild(contextNode, contextChildNode));

    expect(contextChildNode.parentNode).toStrictEqual(contextNode);
  });

  it("dom tree build removed child", () => {
    expect(treeBuilder.appendChild(contextNode, contextChildNode));
    expect(contextChildNode.parentNode).toStrictEqual(contextNode);
    expect(treeBuilder.removeChild(contextNode, contextChildNode));
    expect(contextChildNode.parentNode).toBe(null);
  });

  it("tree build create node", () => {
    expect(treeBuilder.createNode(ns, "div").tagName).toBe("div");
  });

  it("tree build update parsed context", () => {
    expect(treeBuilder.updateParsedContext(contextNode, "new context"));
    expect(contextNode.parsedContext).toBe("new context");
  });
});
