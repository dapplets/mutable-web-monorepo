import { IContextNode } from "../../src/core/tree/types";
import { LayoutManager } from "../../src/layout-manager";

describe("LayoutManager", () => {
  it("build context tree for BOS-component props", () => {
    // Arrange
    const input = {
      namespaceURI: "https://dapplets.org/ns/json/dapplets.near/parser/twitter",
      tagName: "post",
      parsedContext: {
        id: "1232131232",
        text: "Tweet text",
      },
      parentNode: {
        namespaceURI:
          "https://dapplets.org/ns/json/dapplets.near/parser/twitter",
        tagName: "global",
        parsedContext: {
          id: "global",
          username: "nikter",
        },
        parentNode: {
          namespaceURI: "https://dapplets.org/ns/engine",
          tagName: "website",
          parsedContext: {
            id: "twitter.com",
          },
        },
      },
    };

    const expected = {
      namespace: "https://dapplets.org/ns/json/dapplets.near/parser/twitter",
      type: "post",
      parsed: {
        id: "1232131232",
        text: "Tweet text",
      },
      parent: {
        namespace: "https://dapplets.org/ns/json/dapplets.near/parser/twitter",
        type: "global",
        parsed: {
          id: "global",
          username: "nikter",
        },
        parent: {
          namespace: "https://dapplets.org/ns/engine",
          type: "website",
          parsed: {
            id: "twitter.com",
          },
          parent: null,
        },
      },
    };

    // Act
    const actual = LayoutManager._buildContextTree(input as any);

    // Assert
    expect(actual).toEqual(expected);
  });
});
