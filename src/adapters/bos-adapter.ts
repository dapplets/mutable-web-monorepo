import { DynamicHtmlAdapter } from "./dynamic-html-adapter";
import { IAdapter } from "./interface";

export class BosAdapter extends DynamicHtmlAdapter implements IAdapter {
  constructor(
    element: Element,
    document: Document,
    namespace: string,
    name: string = "root"
  ) {
    super(element, document, namespace, name);
  }

  override parseContext() {
    return JSON.parse(this.element.getAttribute("data-props") ?? "{}");
  }

  override findChildElements() {
    return getChildContextElements(this.element, "data-component");
  }

  override createChildAdapter(element: Element) {
    const name = element.getAttribute("data-component")!;
    return new BosAdapter(element, this.document, this.namespace, name);
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
