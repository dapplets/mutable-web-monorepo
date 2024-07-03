const ShadowHostAttr = 'data-mweb-shadow-host'

export function getChildContextElements(
  element: HTMLElement | ShadowRoot,
  attribute: string,
  excludeAttribute?: string
) {
  const result: HTMLElement[] = []

  for (const child of Array.from(element.children)) {
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
