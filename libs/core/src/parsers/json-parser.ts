import { InsertionType } from '../adapters/interface'
import { IParser, InsertionPoint } from './interface'

export type JsonParserConfig = {
  [name: string]: {
    selector?: string
    props?: {
      [prop: string]: string
    }
    insertionPoints?: {
      [insPointName: string]:
        | string
        | {
            selector?: string
            bosLayoutManager?: string
            insertionType?: InsertionType
          }
    }
    children?: string[]
  }
}

const query = (cssOrXPath: string, element: HTMLElement) => {
  try {
    const result = element.querySelector(cssOrXPath)
    if (result) return result.textContent
  } catch (_) {}

  try {
    // ToDo: replace with document.createExpression ?
    const result = element.ownerDocument.evaluate(cssOrXPath, element, null, 0)

    switch (result.resultType) {
      case XPathResult.NUMBER_TYPE:
        return result.numberValue
      case XPathResult.STRING_TYPE:
        return result.stringValue
      case XPathResult.BOOLEAN_TYPE:
        return result.booleanValue
      default:
        return null // ToDo: or undefined?
    }
  } catch (_) {
    console.error(_)
  }

  return null
}

export class JsonParser implements IParser {
  protected config: JsonParserConfig

  constructor(config: JsonParserConfig) {
    // ToDo: validate config
    this.config = config
  }

  parseContext(element: HTMLElement, contextName: string) {
    const contextProperties = this.config[contextName].props
    if (!contextProperties) return {}

    const parsed: any = {}

    for (const [prop, cssOrXpathQuery] of Object.entries(contextProperties)) {
      const value = query(cssOrXpathQuery, element)?.toString() ?? null
      parsed[prop] = value
    }

    return parsed
  }

  findChildElements(
    element: HTMLElement,
    contextName: string
  ): { element: HTMLElement; contextName: string }[] {
    const contextConfig = this.config[contextName]
    if (!contextConfig.children?.length) return []

    const result: { element: HTMLElement; contextName: string }[] = []

    for (const childContextName of contextConfig.children ?? []) {
      const childConfig = this.config[childContextName]
      if (!childConfig.selector) continue

      const childElements = Array.from(element.querySelectorAll<HTMLElement>(childConfig.selector))

      for (const childElement of childElements) {
        result.push({ element: childElement, contextName: childContextName })
      }
    }

    return result
  }

  findInsertionPoint(
    element: HTMLElement,
    contextName: string,
    insertionPoint: string
  ): HTMLElement | null {
    const contextConfig = this.config[contextName]
    const selectorOrObject = contextConfig.insertionPoints?.[insertionPoint]

    if (typeof selectorOrObject === 'string') {
      return element.querySelector(selectorOrObject)
    } else if (selectorOrObject?.selector) {
      return element.querySelector(selectorOrObject.selector)
    } else if (!selectorOrObject?.selector) {
      return element // use context node if selector is not defined
    } else {
      return null
    }
  }

  getInsertionPoints(_: HTMLElement, contextName: string): InsertionPoint[] {
    const contextConfig = this.config[contextName]
    if (!contextConfig.insertionPoints) return []

    return Object.entries(contextConfig.insertionPoints).map(([name, selectorOrObject]) => ({
      name,
      insertionType:
        typeof selectorOrObject === 'string' ? undefined : selectorOrObject.insertionType,
      bosLayoutManager:
        typeof selectorOrObject === 'string' ? undefined : selectorOrObject.bosLayoutManager,
    }))
  }
}
