export function getCurrentMutationId(): string | null {
  return window.sessionStorage.getItem('mutableweb:mutationId')
}

export function setCurrentMutationId(mutationId: string): void {
  return window.sessionStorage.setItem('mutableweb:mutationId', mutationId)
}

export function getPanelPosition(): any {
  return window.sessionStorage.getItem('mutableweb:panelPosition')
}

export function setPanelPosition(positionX: string): void {
  return window.sessionStorage.setItem('mutableweb:panelPosition', positionX)
}
export function getPanelPinned(): any {
  return window.sessionStorage.getItem('mutableweb:panelPinned')
}

export function setPanelPinned(pin: string): void {
  return window.sessionStorage.setItem('mutableweb:panelPinned', pin)
}

export function removePanelPinned(): void {
  return window.sessionStorage.removeItem('mutableweb:panelPinned')
}
