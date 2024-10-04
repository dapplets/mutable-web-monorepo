import { IContextNode } from '@mweb/core'
import { TransferableContext } from '@mweb/backend'

// ToDo: reuse in ContextPicker
export const buildTransferableContext = (context: IContextNode): TransferableContext => ({
  namespace: context.namespace,
  type: context.contextType,
  level: context.contextLevel,
  id: context.id,
  parsed: context.parsedContext,
  parent: context.parentNode ? buildTransferableContext(context.parentNode) : null,
  isVisible: context.isVisible,
})
