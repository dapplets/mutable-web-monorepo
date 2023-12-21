import { IParser } from "./interface";
import { getChildContextElements } from "./utils";

export class BosParser implements IParser {
  parseContext(element: Element) {
    return JSON.parse(element.getAttribute("data-props") ?? "{}");
  }

  findChildElements(element: Element) {
    return getChildContextElements(element, "data-component").map(
      (element) => ({
        element,
        contextName: element.getAttribute("data-component")!,
      })
    );
  }

  findInsertionPoint(
    element: Element,
    _: string,
    insertionPoint: string
  ): Element | null {
    return element.querySelector(`[data-component="${insertionPoint}"]`);
  }
}
