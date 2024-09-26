import { EntityId } from './base.entity'

export type BaseDto = {
  id: EntityId
  localId: string
  authorId: string
  blockNumber: number
  timestamp: number
}
