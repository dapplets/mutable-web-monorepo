export function getIsPanelUnpinned(): boolean {
  return !!window.sessionStorage.getItem('mutableweb:panelPinned')
}

export function setPanelUnpinnedFlag(pin: string): void {
  return window.sessionStorage.setItem('mutableweb:panelPinned', pin)
}

export function removePanelUnpinnedFlag(): void {
  return window.sessionStorage.removeItem('mutableweb:panelPinned')
}
