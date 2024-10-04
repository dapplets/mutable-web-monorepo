import { Base, EntityId } from './base.entity'
import { IRepository } from './repository.interface'
import { EntityMetadata } from '../../common/entity-metadata'

export class BaseAggRepository<T extends Base> implements IRepository<T> {
  constructor(
    private remote: IRepository<T>,
    private local: IRepository<T>
  ) {}

  async getItem(id: EntityId): Promise<T | null> {
    const localItem = await this.local.getItem(id)
    if (localItem) return localItem
    return this.remote.getItem(id)
  }

  async getItems(options?: { authorId?: EntityId; localId?: EntityId }): Promise<T[]> {
    const localItems = await this.local.getItems(options)
    const remoteItems = await this.remote.getItems(options)
    return this._mergeItems(localItems, remoteItems)
  }

  async getItemsByIndex(entity: Partial<T>): Promise<T[]> {
    const localItems = await this.local.getItemsByIndex(entity)
    const socialItems = await this.remote.getItemsByIndex(entity)
    return this._mergeItems(localItems, socialItems)
  }

  async createItem(item: T): Promise<T> {
    await this.local.createItem(item)
    return item
  }

  async editItem(item: T): Promise<T> {
    await this.local.editItem(item)
    return item
  }

  async saveItem(item: T): Promise<T> {
    await this.local.saveItem(item)
    return item
  }

  async deleteItem(id: EntityId): Promise<void> {
    await this.local.deleteItem(id)
  }

  async constructItem(
    item: Omit<T, keyof Base> & { metadata: EntityMetadata<EntityId> }
  ): Promise<T> {
    return this.remote.constructItem(item)
  }

  private _mergeItems(localItems: T[], socialItems: T[]): T[] {
    const mergedItems: T[] = [...localItems]

    for (const socialItem of socialItems) {
      if (!localItems.find((item) => item.id === socialItem.id)) {
        mergedItems.push(socialItem)
      }
    }

    return mergedItems
  }
}
