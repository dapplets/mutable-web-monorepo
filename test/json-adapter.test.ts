import { JsonAdapter } from "../src/adapters/json-adapter";
import { Context } from "../src/types";

const config = {
  contexts: {
    root: {
      selector: "div",
      props: {
        id: "string('global')",
      },
      children: ["post", "msg"],
    },
    post: {
      selector: ".post",
      props: {
        id: "number(.//@data-id)",
        text: ".text",
      },
      insertionPoints: {
        text: ".text",
      },
    },
    msg: {
      selector: ".msg",
      props: {
        id: "number(.//@data-id)",
        text: ".text",
      },
    },
  },
};

describe("JSON adapter", () => {
  let element: HTMLElement;
  let ns: string;
  let adapter: JsonAdapter;
  let ctx: Context;

  beforeEach(() => {
    element = document.createElement("div");
    element.innerHTML = `<div>
          <div class="post" data-id="1"><p class="text">Text 1</p></div>
          <div class="msg" data-id="2"><p class="text">Msg 2</p></div>
      </div>`;

    const xmlDocument = document.implementation.createDocument(
      null,
      "semantictree"
    );

    ns = "https://dapplets.org/ns/json/some-web-site";
    adapter = new JsonAdapter(element, xmlDocument, ns, config);
    ctx = adapter.context;
  });

  it("should return a parsed semantic tree by given html and adapter", () => {
    expect(ctx.tagName).toBe("root");
    expect(ctx.getAttributeNS(ns, "id")).toBe("global");
    expect(ctx.children[0].tagName).toBe("post");
    expect(ctx.children[0].getAttributeNS(ns, "id")).toBe("1");
    expect(ctx.children[0].getAttributeNS(ns, "text")).toBe("Text 1");
    expect(ctx.children[1].tagName).toBe("msg");
    expect(ctx.children[1].getAttributeNS(ns, "id")).toBe("2");
    expect(ctx.children[1].getAttributeNS(ns, "text")).toBe("Msg 2");
  });

  it("should parse dynamically changed html", async () => {
    // dynamic change of the DOM
    element.querySelector(".post p")!.innerHTML = "Text 1 changed";
    element.querySelector(".msg p")!.innerHTML = "Msg 2 changed";

    // wait while MutationObserver will update the semantic tree
    // ToDo: wait for context changed event?
    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(ctx.children[0].getAttributeNS(ns, "text")).toBe("Text 1 changed");
    expect(ctx.children[1].getAttributeNS(ns, "text")).toBe("Msg 2 changed");
  });
});
