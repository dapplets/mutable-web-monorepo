import { IParser, InsertionPoint } from './interface'

const BlinkDomain = 'augm.link'

function tryParseUrl(text: string): URL | null {
  try {
    return new URL(text)
  } catch (_) {
    return null
  }
}

function isBlinkUrl(url: string): boolean {
  return tryParseUrl(url)?.host === BlinkDomain
}

// ToDo: move to the engine? It's mutable web specific logic
export class BlinkParser implements IParser {
  parseContext({ href, innerText }: HTMLAnchorElement) {
    if (isBlinkUrl(href)) {
      return {
        id: href,
        url: href,
      }
    } else if (isBlinkUrl(innerText)) {
      // ToDo: twitter-specific logic. Twitter adds '…' to the end of the url
      const cleanUrl = innerText.replace(/…$/g, '')

      return {
        id: cleanUrl,
        url: cleanUrl,
      }
    } else {
      return {}
    }
  }

  findChildElements(element: HTMLElement) {
    // Using <a> inside of <a> is not valid, so only one level of nesting is possible
    if (element.tagName === 'A') return []

    return Array.from(element.querySelectorAll('a'))
      .filter((a) => isBlinkUrl(a.href) || isBlinkUrl(a.innerText)) // ToDo: double check
      .map((element) => ({
        element,
        contextName: 'blink',
      }))
  }

  findInsertionPoint(): HTMLElement | null {
    // No insertions points in blinks
    return null
  }

  getInsertionPoints(): InsertionPoint[] {
    // No insertions points in blinks
    return []
  }
}
