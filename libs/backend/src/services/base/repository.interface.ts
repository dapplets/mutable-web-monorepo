import { EntityMetadata } from '../../common/entity-metadata'
import { Transaction } from '../unit-of-work/transaction'
import { Base, EntityId, EntitySourceType } from './base.entity'

export interface IRepository<T extends Base> {
  getItem(options: { id: EntityId; source?: EntitySourceType; version?: string }): Promise<T | null>
  getItems(options?: { authorId?: string; localId?: string }): Promise<T[]>
  getItemsByIndex(entity: Partial<T>): Promise<T[]>
  createItem(item: T, tx?: Transaction): Promise<T>
  editItem(item: T, tx?: Transaction): Promise<T>
  saveItem(item: T, tx?: Transaction): Promise<T>
  deleteItem(id: EntityId, tx?: Transaction): Promise<void>
  constructItem(item: Omit<T, keyof Base> & { metadata: EntityMetadata<EntityId> }): Promise<T>
  getTagValue(options: {
    id: EntityId
    source?: EntitySourceType
    tag: string
  }): Promise<string | null>
  getTags(options: { id: EntityId; source?: EntitySourceType }): Promise<string[]>
  getVersions(options: { id: EntityId; source?: EntitySourceType }): Promise<string[]>
}
