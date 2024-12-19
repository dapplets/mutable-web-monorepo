const apiUrl = process.env.REACT_APP_API_URL ?? 'http://localhost:3001'

export type ContextDto = {
  namespace: string
  contextType: string
  id: string | null
  parsedContext: any
  children?: ContextDto[]
  parentNode?: ContextDto | null
}

export function getGraph() {
  return fetch(`${apiUrl}/context`).then((res) => res.json())
}

export function getContext(
  hash: string
): Promise<{ context: ContextDto | null; status: 'paid' | 'unpaid' }> {
  return fetch(`${apiUrl}/context/${encodeURIComponent(hash)}`).then((res) => res.json())
}
