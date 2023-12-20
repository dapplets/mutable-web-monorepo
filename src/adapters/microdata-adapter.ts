import { getChildContextElements } from "./bos-adapter";
import { DynamicHtmlAdapter } from "./dynamic-html-adapter";
import { IAdapter } from "./interface";

export class MicrodataAdapter extends DynamicHtmlAdapter implements IAdapter {
  constructor(
    element: Element,
    document: Document,
    namespace: string,
    name: string = "root"
  ) {
    super(element, document, namespace, name);
  }

  override parseContext() {
    const elements = getChildContextElements(this.element, "itemprop");

    for (const element of elements) {
      const propName = element.getAttribute("itemprop")!;
      const propValue = MicrodataAdapter.getPropertyValue(element);

      if (propValue !== undefined) {
        this.context.setAttributeNS(this.namespace, propName, propValue);
      } else {
        this.context.removeAttributeNS(this.namespace, propName);
      }
    }

    if (this.element.hasAttribute("itemid")) {
      const id = this.element.getAttribute("itemid")!;
      this.context.setAttributeNS(this.namespace, "id", id);
    }
  }

  override findChildElements() {
    return getChildContextElements(this.element, "itemtype");
  }

  override createChildAdapter(element: Element) {
    const name = element.getAttribute("itemtype")!;
    return new MicrodataAdapter(element, this.document, this.namespace, name);
  }

  static getPropertyValue(element: Element) {
    if (element.hasAttribute("itemscope")) {
      return undefined;
    } else if (element.tagName.toLowerCase() === "meta") {
      return element.getAttribute("content")?.trim();
    } else if (
      ["audio", "embed", "iframe", "img", "source", "track", "video"].includes(
        element.tagName.toLowerCase()
      ) ||
      ["a", "area", "link"].includes(element.tagName.toLowerCase())
    ) {
      return element.getAttribute("src") || element.getAttribute("href") || "";
    } else if (element.tagName.toLowerCase() === "object") {
      return element.getAttribute("data") || "";
    } else if (
      element.tagName.toLowerCase() === "data" ||
      element.tagName.toLowerCase() === "meter"
    ) {
      return element.getAttribute("value") || "";
    } else if (element.tagName.toLowerCase() === "time") {
      return element.getAttribute("datetime") || "";
    } else if (element.hasAttribute("content")) {
      return element.getAttribute("content")?.trim();
    } else {
      return element.textContent?.trim();
    }
  }
}
