import { Base, EntityId, EntitySourceType } from './base.entity'
import { IRepository } from './repository.interface'
import { EntityMetadata } from '../../common/entity-metadata'
import { Transaction } from '../unit-of-work/transaction'

export class BaseAggRepository<T extends Base> implements IRepository<T> {
  constructor(
    private remote: IRepository<T>,
    private local: IRepository<T>
  ) {}

  async getItem(id: EntityId, source?: EntitySourceType): Promise<T | null> {
    if (source === EntitySourceType.Local) {
      return this.local.getItem(id)
    } else if (source === EntitySourceType.Origin) {
      return this.remote.getItem(id)
    } else {
      // ToDo: why local is preferred?
      const localItem = await this.local.getItem(id)
      if (localItem) return localItem
      return this.remote.getItem(id)
    }
  }

  async getItems(options?: { authorId?: EntityId; localId?: EntityId }): Promise<T[]> {
    const localItems = await this.local.getItems(options)
    const remoteItems = await this.remote.getItems(options)
    return [...localItems, ...remoteItems]
  }

  async getItemsByIndex(entity: Partial<T>): Promise<T[]> {
    const localItems = await this.local.getItemsByIndex(entity)
    const remoteItems = await this.remote.getItemsByIndex(entity)
    return [...localItems, ...remoteItems]
  }

  async createItem(item: T, tx?: Transaction): Promise<T> {
    if (item.source === EntitySourceType.Local) {
      return this.local.createItem(item)
    } else if (item.source === EntitySourceType.Origin) {
      const result = await this.remote.createItem(item, tx)
      await this._deleteLocalItemIfExist(item.id)
      return result
    } else {
      throw new Error('Invalid source')
    }
  }

  async editItem(item: T, tx?: Transaction): Promise<T> {
    if (item.source === EntitySourceType.Local) {
      return this.local.editItem(item)
    } else if (item.source === EntitySourceType.Origin) {
      const result = await this.remote.editItem(item, tx)
      await this._deleteLocalItemIfExist(item.id)
      return result
    } else {
      throw new Error('Invalid source')
    }
  }

  async saveItem(item: T, tx?: Transaction): Promise<T> {
    if (item.source === EntitySourceType.Local) {
      return this.local.saveItem(item)
    } else if (item.source === EntitySourceType.Origin) {
      const result = await this.remote.saveItem(item, tx)
      await this._deleteLocalItemIfExist(item.id)
      return result
    } else {
      throw new Error('Invalid source')
    }
  }

  async deleteItem(id: EntityId): Promise<void> {
    // ToDo: not obvious that local will be deleted
    await this.local.deleteItem(id)
  }

  async constructItem(
    item: Omit<T, keyof Base> & { metadata: EntityMetadata<EntityId>; source: EntitySourceType }
  ): Promise<T> {
    if (item.source === EntitySourceType.Local) {
      return this.local.constructItem(item)
    } else if (item.source === EntitySourceType.Origin) {
      return this.remote.constructItem(item)
    } else {
      throw new Error('Invalid source')
    }
  }

  private async _deleteLocalItemIfExist(id: EntityId) {
    if (await this.local.getItem(id)) {
      await this.local.deleteItem(id)
    }
  }
}
