const ShadowHostAttr = 'data-mweb-shadow-host'

export function getChildContextElements(
  element: Element | ShadowRoot,
  attribute: string,
  excludeAttribute?: string
) {
  const result: Element[] = []

  for (const child of element.children) {
    if (child instanceof HTMLElement) {
      if (excludeAttribute && child.hasAttribute(excludeAttribute)) {
        continue
      } else if (child.hasAttribute(attribute)) {
        result.push(child)
      } else if (child.hasAttribute(ShadowHostAttr) && child.shadowRoot) {
        // ToDo: it's mweb-parser specific logic
        result.push(...getChildContextElements(child.shadowRoot, attribute, excludeAttribute))
      } else {
        result.push(...getChildContextElements(child, attribute, excludeAttribute))
      }
    }
  }

  return result
}
