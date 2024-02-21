export function getCurrentMutationId(): string | null {
  return window.sessionStorage.getItem('mutableweb:mutationId')
}

export function setCurrentMutationId(mutationId: string): void {
  return window.sessionStorage.setItem('mutableweb:mutationId', mutationId)
}
