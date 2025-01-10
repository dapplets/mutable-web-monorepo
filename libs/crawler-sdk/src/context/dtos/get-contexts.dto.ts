export type GetContextsDto = {
  nodes: { id: string; label: string }[]
  edges: { id: string; source: string; target: string }[]
}
