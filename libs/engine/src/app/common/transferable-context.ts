import { IContextNode, ContextLevel } from '@mweb/core'

export interface TransferableContext {
  namespace: string
  type: string
  level: ContextLevel
  id: string | null
  parsed: any
  parent: TransferableContext | null
}

// ToDo: reuse in ContextPicker
export const buildTransferableContext = (context: IContextNode): TransferableContext => ({
  namespace: context.namespace,
  type: context.contextType,
  level: context.contextLevel,
  id: context.id,
  parsed: context.parsedContext,
  parent: context.parentNode ? buildTransferableContext(context.parentNode) : null,
})
