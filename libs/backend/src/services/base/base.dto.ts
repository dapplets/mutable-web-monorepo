import { EntityId, EntitySourceType } from './base.entity'

export type BaseDto = {
  id: EntityId
  source: EntitySourceType
  localId: string
  authorId: string
  blockNumber: number
  timestamp: number
}
