import { Base, EntityId, EntitySourceType } from './base.entity'
import { IRepository } from './repository.interface'
import { EntityMetadata } from '../../common/entity-metadata'
import { Transaction } from '../unit-of-work/transaction'

export class BaseAggRepository<T extends Base> implements IRepository<T> {
  constructor(
    private remote: IRepository<T>,
    private local: IRepository<T>
  ) {}

  async getItem({
    id,
    source,
    version,
  }: {
    id: EntityId
    source?: EntitySourceType
    version?: string
  }): Promise<T | null> {
    if (source === EntitySourceType.Local) {
      return this.local.getItem({ id, version })
    } else if (source === EntitySourceType.Origin) {
      return this.remote.getItem({ id, version })
    } else {
      // ToDo: why local is preferred?
      const localItem = await this.local.getItem({ id, version })
      if (localItem) return localItem
      return this.remote.getItem({ id, version })
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
      await this._deleteLocalItemIfExist(`/${item.entityType}/${item.localId}`) // entities created without a wallet
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

  async getTagValue({
    id,
    source,
    tag,
  }: {
    id: EntityId
    source?: EntitySourceType
    tag: string
  }): Promise<string | null> {
    if (source === EntitySourceType.Local) {
      return this.local.getTagValue({ id, tag })
    } else if (source === EntitySourceType.Origin) {
      return this.remote.getTagValue({ id, tag })
    } else {
      throw new Error('Invalid source')
    }
  }

  async getTags({ id, source }: { id: EntityId; source?: EntitySourceType }): Promise<string[]> {
    if (source === EntitySourceType.Local) {
      return this.local.getTags({ id })
    } else if (source === EntitySourceType.Origin) {
      return this.remote.getTags({ id })
    } else {
      throw new Error('Invalid source')
    }
  }

  async getVersions({
    id,
    source,
  }: {
    id: EntityId
    source?: EntitySourceType
  }): Promise<string[]> {
    if (source === EntitySourceType.Local) {
      return this.local.getVersions({ id })
    } else if (source === EntitySourceType.Origin) {
      return this.remote.getVersions({ id })
    } else {
      throw new Error('Invalid source')
    }
  }

  private async _deleteLocalItemIfExist(id: EntityId) {
    if (await this.local.getItem({ id })) {
      await this.local.deleteItem(id)
    }
  }
}
