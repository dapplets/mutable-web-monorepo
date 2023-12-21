import { IHtmlParser } from "./interface";

export class BosAdapter implements IHtmlParser {
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
}

// ToDo: move to utils
export function getChildContextElements(
  element: Element,
  attribute: string,
  excludeAttribute?: string
) {
  const result: Element[] = [];

  for (const child of element.children) {
    if (child instanceof HTMLElement) {
      if (excludeAttribute && child.hasAttribute(excludeAttribute)) {
        continue;
      } else if (child.hasAttribute(attribute)) {
        result.push(child);
      } else {
        result.push(...getChildContextElements(child, attribute));
      }
    }
  }

  return result;
}
