import { DynamicHtmlAdapter } from "./dynamic-html-adapter";
import { IAdapter } from "./interface";

export class BosAdapter extends DynamicHtmlAdapter implements IAdapter {
  override parseContext() {
    return JSON.parse(this.element.getAttribute("data-props") ?? "{}");
  }

  override findChildElements() {
    return getChildContextElements(this.element, "data-component");
  }

  override createChildAdapter(element: Element) {
    return new BosAdapter(element, element.getAttribute("data-component")!);
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
  