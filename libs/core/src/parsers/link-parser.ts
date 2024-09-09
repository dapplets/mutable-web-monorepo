import { IParser, InsertionPoint } from './interface'

function tryParseUrl(text: string): URL | null {
  try {
    return new URL(text)
  } catch (_) {
    return null
  }
}

export class LinkParser implements IParser {
  parseContext(element: HTMLAnchorElement, contextName: string) {
    if (contextName === 'root') return { id: 'global' }

    // ToDo: twitter-specific logic. Twitter adds '…' to the end of the url
    const cleanUrl = element.innerText.replace(/…$/g, '')

    return {
      id: element.href,
      href: element.href,
      innerHref: tryParseUrl(cleanUrl)?.href,
      innerText: element.innerText,
    }
  }

  findChildElements(element: HTMLElement) {
    // Using <a> inside of <a> is not valid, so only one level of nesting is possible
    if (element.tagName === 'A') return []

    return Array.from(element.querySelectorAll('a')).map((element) => ({
      element,
      contextName: 'link',
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
