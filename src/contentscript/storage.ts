export function getPanelPinned(): any {
  return window.sessionStorage.getItem('mutableweb:panelPinned')
}

export function setPanelPinned(pin: string): void {
  return window.sessionStorage.setItem('mutableweb:panelPinned', pin)
}

export function removePanelPinned(): void {
  return window.sessionStorage.removeItem('mutableweb:panelPinned')
}
