import { SocialDbProvider } from "../../../src/providers/social-db-provider";

describe("SocialDbProvider", () => {
  it("is suitable target and context: id exists", () => {
    // Arrange
    const ifTarget = {
      contextType: "tw:post",
      "tw:id": "*",
      "tw:text": "Hello",
    };

    const aliases = {
      tw: "https://dapplets.org/ns/json/dapplets.near/parser/twitter",
    };

    const context = {
      namespaceURI: "https://dapplets.org/ns/json/dapplets.near/parser/twitter",
      tagName: "post",
      parsedContext: {
        id: "123",
        text: "Hello",
      },
    };

    const expected = {
      contextType: "tw:post",
      "tw:id": "123",
      "tw:text": "Hello",
    };

    // Act
    const actual = SocialDbProvider._tryFillAppTargetWithContext(
      ifTarget,
      aliases,
      context as any
    );

    // Assert
    expect(actual).toEqual(expected);
  });

  it("is suitable target and context: no id", () => {
    // Arrange
    const ifTarget = {
      contextType: "tw:post",
      "tw:id": "*",
    };

    const aliases = {
      tw: "https://dapplets.org/ns/json/dapplets.near/parser/twitter",
    };

    const context = {
      namespaceURI: "https://dapplets.org/ns/json/dapplets.near/parser/twitter",
      tagName: "post",
      parsedContext: {},
    };

    const expected = null;

    // Act
    const actual = SocialDbProvider._tryFillAppTargetWithContext(
      ifTarget,
      aliases,
      context as any
    );

    // Assert
    expect(actual).toBe(expected);
  });

  it("parses ns alias property with alias", () => {
    // Arrange
    const input = "ns:value";
    const expected = { alias: "ns", value: "value" };

    // Act
    const actual = SocialDbProvider._parseNsValue(input);

    // Assert
    expect(actual).toEqual(expected);
  });

  it("parses ns alias property without alias", () => {
    // Arrange
    const input = "value";
    const expected = { alias: null, value: "value" };

    // Act
    const actual = SocialDbProvider._parseNsValue(input);

    // Assert
    expect(actual).toEqual(expected);
  });

  it("splits nested key-value object by given depth", () => {
    // Arrange
    const depth = 5;
    const object = {
      "bos.dapplets.near": {
        settings: {
          "dapplets.near": {
            mutation: { one: { test1: "test1" }, two: { test2: "test2" } },
          },
        },
      },
      "dapplets.near": {
        settings: {
          "dapplets.near": { mutation: { three: { test3: "test3" } } },
        },
      },
    };
    const expected = {
      "bos.dapplets.near/settings/dapplets.near/mutation/one": {
        test1: "test1",
      },
      "bos.dapplets.near/settings/dapplets.near/mutation/two": {
        test2: "test2",
      },
      "dapplets.near/settings/dapplets.near/mutation/three": {
        test3: "test3",
      },
    };

    // Act
    const actual = SocialDbProvider._splitObjectByDepth(object, depth);

    // Assert
    expect(actual).toEqual(expected);
  });
});
