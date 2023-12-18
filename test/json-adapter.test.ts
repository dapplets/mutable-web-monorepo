import { JsonAdapter } from "../src/adapters/json-adapter";

const config = {
  context: {
    type: "root",
    selector: "div",
    props: {
      id: "string('global')",
    },
  },
  children: [
    {
      context: {
        type: "post",
        selector: ".post",
        props: {
          id: "number(.//@data-id)",
          text: ".text",
        },
      },
    },
    {
      context: {
        type: "msg",
        selector: ".msg",
        props: {
          id: "number(.//@data-id)",
          text: ".text",
        },
      },
    },
  ],
};

describe("semantic tree", () => {
  it("should return a parsed semantic tree by given html and adapter", () => {
    const element = document.createElement("div");
    element.innerHTML = `<div>
          <div class="post" data-id="1"><p class="text">Text 1</p></div>
          <div class="msg" data-id="2"><p class="text">Msg 2</p></div>
      </div>`;

    const adapter = new JsonAdapter(element, config);
    const { root } = adapter;

    adapter.start();

    expect(root.type).toBe("root");
    expect(root.props.id).toBe("global");
    expect(root.children[0].type).toBe("post");
    expect(root.children[0].props.id).toBe(1);
    expect(root.children[0].props.text).toBe("Text 1");
    expect(root.children[1].type).toBe("msg");
    expect(root.children[1].props.id).toBe(2);
    expect(root.children[1].props.text).toBe("Msg 2");
  });

  it("should parse dynamically changed html", async () => {
    const element = document.createElement("div");
    element.innerHTML = `<div>
          <div class="post" data-id="1"><p class="text">Text 1</p></div>
          <div class="msg" data-id="2"><p class="text">Msg 2</p></div>
      </div>`;

    const adapter = new JsonAdapter(element, config);
    const { root } = adapter;

    adapter.start();

    // dynamic change of the DOM
    element.querySelector(".post p")!.innerHTML = "Text 1 changed";
    element.querySelector(".msg p")!.innerHTML = "Msg 2 changed";

    // wait while MutationObserver will update the semantic tree
    // ToDo: wait for context changed event?
    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(root.type).toBe("root");
    expect(root.props.id).toBe("global");
    expect(root.children[0].type).toBe("post");
    expect(root.children[0].props.id).toBe(1);
    expect(root.children[0].props.text).toBe("Text 1 changed");
    expect(root.children[1].type).toBe("msg");
    expect(root.children[1].props.id).toBe(2);
    expect(root.children[1].props.text).toBe("Msg 2 changed");
  });
});
