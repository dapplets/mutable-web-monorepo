import { getChildContextElements } from './utils'
import { IParser, InsertionPoint } from './interface'

export class MicrodataParser implements IParser {
  parseContext(element: HTMLElement) {
    const childElements = getChildContextElements(element, 'itemprop')
    const result: any = {}

    for (const childElement of childElements) {
      const propName = childElement.getAttribute('itemprop')!
      const propValue = MicrodataParser.getPropertyValue(childElement) ?? null
      result[propName] = propValue
    }

    if (element.hasAttribute('itemid')) {
      const id = element.getAttribute('itemid')!
      result['id'] = id
    }

    return result
  }

  findChildElements(element: HTMLElement) {
    return getChildContextElements(element, 'itemtype').map((element) => ({
      element,
      contextName: element.getAttribute('itemtype')!,
    }))
  }

  findInsertionPoint(element: HTMLElement, _: string, insertionPoint: string): HTMLElement | null {
    return element.querySelector(`[itemtype="${insertionPoint}"]`)
  }

  getInsertionPoints(element: HTMLElement): InsertionPoint[] {
    return getChildContextElements(element, 'itemtype').map((el) => ({
      name: el.getAttribute('itemtype')!,
    }))
  }

  static getPropertyValue(element: HTMLElement) {
    if (element.hasAttribute('itemscope')) {
      return undefined
    } else if (element.tagName.toLowerCase() === 'meta') {
      return element.getAttribute('content')?.trim()
    } else if (
      ['audio', 'embed', 'iframe', 'img', 'source', 'track', 'video'].includes(
        element.tagName.toLowerCase()
      ) ||
      ['a', 'area', 'link'].includes(element.tagName.toLowerCase())
    ) {
      return element.getAttribute('src') || element.getAttribute('href') || ''
    } else if (element.tagName.toLowerCase() === 'object') {
      return element.getAttribute('data') || ''
    } else if (
      element.tagName.toLowerCase() === 'data' ||
      element.tagName.toLowerCase() === 'meter'
    ) {
      return element.getAttribute('value') || ''
    } else if (element.tagName.toLowerCase() === 'time') {
      return element.getAttribute('datetime') || ''
    } else if (element.hasAttribute('content')) {
      return element.getAttribute('content')?.trim()
    } else {
      return element.textContent?.trim()
    }
  }
}
