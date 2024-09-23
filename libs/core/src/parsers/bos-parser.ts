import { InsertionType } from '../adapters/interface'
import { IParser, InsertionPoint } from './interface'

const CompAttr = 'data-component'
const PropsAttr = 'data-props'

export type BosParserConfig = {
  [name: string]: {
    component?: string
    props?: {
      [prop: string]: string
    }
    insertionPoints?: {
      [insPointName: string]: {
        component?: string
        bosLayoutManager?: string
        insertionType?: InsertionType
      }
    }
    children?: string[]
  }
}

export class BosParser implements IParser {
  protected config: BosParserConfig

  constructor(config: BosParserConfig) {
    // ToDo: validate config
    this.config = config

    if (!this.config['root']) {
      this.config['root'] = {
        props: {
          id: 'root',
        },
        children: Object.keys(this.config), // ToDo:
      }
    }
  }

  parseContext(element: HTMLElement, contextName: string) {
    const contextProperties = this.config[contextName].props
    if (!contextProperties) return {}

    const parsed: any = {}
    const bosProps = JSON.parse(element.getAttribute(PropsAttr) ?? '{}')

    for (const [prop, mustacheTemplate] of Object.entries(contextProperties)) {
      const value = replaceMustaches(mustacheTemplate, { props: bosProps })
      parsed[prop] = value
    }

    return parsed
  }

  findChildElements(element: HTMLElement, contextName: string) {
    const contextConfig = this.config[contextName]
    if (!contextConfig.children?.length) return []

    const result: { element: HTMLElement; contextName: string }[] = []

    // ToDo: maybe querySelectorAll('.foo:not(.foo .foo)') is faster?
    for (const childContextName of contextConfig.children ?? []) {
      const childConfig = this.config[childContextName]
      if (!childConfig.component) continue

      const childElements = Array.from(
        element.querySelectorAll<HTMLElement>(`[${CompAttr}="${childConfig.component}"]`)
      )

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
    const insPointConfig = contextConfig.insertionPoints?.[insertionPoint]

    if (insPointConfig?.component) {
      return element.querySelector(`[${CompAttr}="${insPointConfig.component}"]`)
    } else if (insPointConfig) {
      // if `component` is not defined use self
      return element
    } else {
      return null
    }
  }

  getInsertionPoints(_: HTMLElement, contextName: string): InsertionPoint[] {
    const contextConfig = this.config[contextName]
    if (!contextConfig.insertionPoints) return []

    return Object.entries(contextConfig.insertionPoints).map(([name, selectorOrObject]) => ({
      name,
      insertionType: selectorOrObject.insertionType,
      bosLayoutManager: selectorOrObject.bosLayoutManager,
    }))
  }
}

/**
 * Executes a template string by replacing placeholders with corresponding values from the provided data object.
 *
 * @param {string} template - The template string containing placeholders in the format '{{key.subkey}}'.
 * @param {Object} data - The data object containing values to replace the placeholders in the template.
 * @returns {string} - The result string after replacing placeholders with actual values.
 *
 * @example
 * const template = "{{props.a}}/{{props.b.c}}";
 * const data = {
 *   props: {
 *     a: 1,
 *     b: {
 *       c: 2
 *     }
 *   }
 * };
 * const result = exec(template, data);
 * console.log(result); // "1/2"
 */
export function replaceMustaches(template: string, data: any): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const keys = key.split('.')
    let value = data

    for (const k of keys) {
      if (value.hasOwnProperty(k)) {
        value = value[k]
      } else {
        return match
      }
    }

    return String(value)
  })
}
