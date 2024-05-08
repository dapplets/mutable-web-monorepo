export function getIsPanelPinned(): any {
  return window.sessionStorage.getItem('mutableweb:panelPinned')
}

export function setPanelUnpinned(pin: string): void {
  return window.sessionStorage.setItem('mutableweb:panelPinned', pin)
}

export function removePanelUnpinned(): void {
  return window.sessionStorage.removeItem('mutableweb:panelPinned')
}
