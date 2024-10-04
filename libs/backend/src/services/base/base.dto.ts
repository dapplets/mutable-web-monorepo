import { EntityId } from './base.entity'

export type BaseDto = {
  id: EntityId
  source: 'origin' | 'local'
  localId: string
  authorId: string
  blockNumber: number
  timestamp: number
}
