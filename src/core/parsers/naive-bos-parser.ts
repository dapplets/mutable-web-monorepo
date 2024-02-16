import { IParser, InsertionPoint } from './interface'
import { getChildContextElements } from './utils'

const CompAttr = 'data-component'
const PropsAttr = 'data-props'

export class NaiveBosParser implements IParser {
  parseContext(element: Element) {
    return JSON.parse(element.getAttribute(PropsAttr) ?? '{}')
  }

  findChildElements(element: Element) {
    return getChildContextElements(element, CompAttr).map((element) => ({
      element,
      contextName: element.getAttribute(CompAttr)!.replace('/widget/', '--'), // ToDo: how to escape slashes?
    }))
  }

  findInsertionPoint(element: Element, _: string, insertionPoint: string): Element | null {
    return element.querySelector(`[${CompAttr}="${insertionPoint}"]`)
  }

  getInsertionPoints(element: Element): InsertionPoint[] {
    return getChildContextElements(element, CompAttr).map((el) => ({
      name: el.getAttribute(CompAttr)!.replace('/widget/', '--'),
    }))
  }
}
