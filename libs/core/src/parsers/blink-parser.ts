import { IParser, InsertionPoint } from './interface'

const BlinkDomain = 'augm.link'

function tryParseUrl(text: string): URL | null {
  try {
    return new URL(text)
  } catch (_) {
    return null
  }
}

function getChildContextElements(element: HTMLElement) {
  const result: HTMLElement[] = []

  for (const child of Array.from(element.children)) {
    if (child instanceof HTMLElement) {
      if (child.tagName === 'A' && tryParseUrl(child.innerText)?.host === BlinkDomain) {
        result.push(child)
      } else {
        result.push(...getChildContextElements(child))
      }
    }
  }

  return result
}

// ToDo: move to the engine? It's mutable web specific logic
export class BlinkParser implements IParser {
  parseContext(element: HTMLElement, contextName: string) {
    const url = tryParseUrl(element.innerText)
    if (!url) return {}
    if (url.host !== BlinkDomain) return {}

    // ToDo: twitter-specific logic
    const href = url.href.replace(/…$/g, '')

    return {
      id: href,
      url: href,
    }
  }

  findChildElements(element: HTMLElement) {
    return getChildContextElements(element).map((element) => ({
      element,
      contextName: 'blink',
    }))
  }

  findInsertionPoint(
    element: HTMLElement | ShadowRoot,
    contextName: string,
    insertionPoint: string
  ): HTMLElement | null {
    return null
  }

  getInsertionPoints(element: HTMLElement): InsertionPoint[] {
    return []
  }
}
