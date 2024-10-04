import { ContextLevel } from '@mweb/core'

export interface TransferableContext {
  namespace: string
  type: string
  level: ContextLevel
  id: string | null
  parsed: any
  parent: TransferableContext | null
  isVisible: boolean
}
