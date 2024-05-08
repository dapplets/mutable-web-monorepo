import { ViewportElementId, ViewportInnerElementId } from './constants'

export function getViewport(): HTMLElement | null {
  return (
    document
      .getElementById(ViewportElementId)
      ?.shadowRoot?.getElementById(ViewportInnerElementId) ?? null
  )
}
