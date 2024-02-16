export function getChildContextElements(
  element: Element,
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
      } else {
        result.push(...getChildContextElements(child, attribute))
      }
    }
  }

  return result
}
