export type ClonedContextNode = {
  namespace: string
  contextType: string
  id: string | null
  parsedContext: any
  children?: ClonedContextNode[]
  parentNode?: ClonedContextNode | null
}
