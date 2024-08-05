import { getChildContextElements } from './utils'
import { IParser, InsertionPoint } from './interface'
import { InsertionType } from '../adapters/interface'

const ParsedContextAttr = 'data-mweb-context-parsed'
const ContextTypeAttr = 'data-mweb-context-type'
const InsPointAttr = 'data-mweb-insertion-point'
const ShadowHostAttr = 'data-mweb-shadow-host'
const LayoutManagerAttr = 'data-mweb-layout-manager'

export class MutableWebParser implements IParser {
  shouldParseShadowDom = true

  parseContext(element: HTMLElement, contextName: string) {
    if (contextName === 'root') return { id: 'global' }
    const json = element.getAttribute(ParsedContextAttr)
    if (!json) return {}
    return JSON.parse(json)
  }

  findChildElements(element: HTMLElement) {
    return getChildContextElements(element, ContextTypeAttr).map((element) => ({
      element,
      contextName: element.getAttribute(ContextTypeAttr)!,
    }))
  }

  findInsertionPoint(
    element: HTMLElement | ShadowRoot,
    contextName: string,
    insertionPoint: string
  ): HTMLElement | null {
    // ToDo: use getChildContextElements

    const insPointElement = element.querySelector<HTMLElement>(
      `[${InsPointAttr}="${insertionPoint}"]`
    )
    if (insPointElement) return insPointElement

    if (
      element instanceof HTMLElement &&
      element.hasAttribute(ShadowHostAttr) &&
      element.shadowRoot
    ) {
      return this.findInsertionPoint(element.shadowRoot, contextName, insertionPoint)
    }

    const shadowHosts = Array.from(element.querySelectorAll(`[${ShadowHostAttr}]`))
    for (const shadowHost of shadowHosts) {
      if (!shadowHost.shadowRoot) continue

      const insPointElement = this.findInsertionPoint(
        shadowHost.shadowRoot,
        contextName,
        insertionPoint
      )

      if (insPointElement) return insPointElement
    }

    return null
  }

  getInsertionPoints(element: HTMLElement): InsertionPoint[] {
    return getChildContextElements(element, InsPointAttr, ContextTypeAttr).map((el) => ({
      name: el.getAttribute(InsPointAttr)!,
      insertionType: InsertionType.End,
      bosLayoutManager: el.getAttribute(LayoutManagerAttr) || undefined,
    }))
  }
}
