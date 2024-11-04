import { EntityMetadata } from '../../common/entity-metadata'
import { Transaction } from '../unit-of-work/transaction'
import { Base, EntityId } from './base.entity'

export interface IRepository<T extends Base> {
  getItem(id: EntityId): Promise<T | null>
  getItems(options?: { authorId?: string; localId?: string }): Promise<T[]>
  getItemsByIndex(entity: Partial<T>): Promise<T[]>
  createItem(item: T, tx?: Transaction): Promise<T>
  editItem(item: T, tx?: Transaction): Promise<T>
  saveItem(item: T, tx?: Transaction): Promise<T>
  deleteItem(id: EntityId, tx?: Transaction): Promise<void>
  constructItem(item: Omit<T, keyof Base> & { metadata: EntityMetadata<EntityId> }): Promise<T>
}
