import { IContextNode } from '@mweb/core'

export interface TransferableContext {
  namespace: string
  type: string
  id: string | null
  parsed: any
  parent: TransferableContext | null
  isVisible: boolean
}

// ToDo: reuse in ContextPicker
export const buildTransferableContext = (context: IContextNode): TransferableContext => ({
  namespace: context.namespace,
  type: context.contextType,
  id: context.id,
  parsed: context.parsedContext,
  parent: context.parentNode ? buildTransferableContext(context.parentNode) : null,
  isVisible: context.isVisible,
})
