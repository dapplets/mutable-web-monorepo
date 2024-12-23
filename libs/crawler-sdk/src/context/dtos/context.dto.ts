export type ContextDto = {
  namespace: string
  contextType: string
  id: string | null
  parsedContext: any
  children?: ContextDto[]
  parentNode?: ContextDto | null
}
