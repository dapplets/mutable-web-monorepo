export type Target = {
  namespace: string
  contextType: string
  isVisible?: boolean
  if: Record<string, TargetCondition>
  parent?: Target
}

export type TargetCondition = {
  not?: ScalarType
  eq?: ScalarType
  contains?: string
  in?: ScalarType[]
  index?: boolean
  endsWith?: string
}

export type ScalarType = string | number | boolean | null
