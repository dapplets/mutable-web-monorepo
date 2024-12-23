import { ContextDto } from './context.dto'

export type GetContextDto = {
  context: ContextDto | null
  status: 'paid' | 'unpaid'
}
