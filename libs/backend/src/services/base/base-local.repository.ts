import { Base, EntityId, EntitySourceType } from './base.entity'
import { getEntity } from './decorators/entity'
import { IRepository } from './repository.interface'
import { IStorage } from '../local-db/local-storage'
import { isDeepEqual } from '../../common/is-deep-equal'
import { EntityMetadata } from '../../common/entity-metadata'

const KeyDelimiter = '/'

export class BaseLocalRepository<T extends Base> implements IRepository<T> {
  private _entityKey: string

  constructor(
    private EntityType: { new (): T },
    public storage: IStorage
  ) {
    this._entityKey = getEntity(EntityType).name
  }

  async getItem({ id }: { id: EntityId }): Promise<T | null> {
    const parsedId = BaseLocalRepository._parseGlobalId(id)
    if (!parsedId) return null

    const json = await this.storage.getItem(id)
    if (!json) return null

    const history: T[] = json ? JSON.parse(json) ?? [] : []
    if (!history) return null

    const raw = history.pop()
    if (!raw) return null

    // @ts-ignore
    const entity: T = this.EntityType.create({ source: EntitySourceType.Local, ...raw })

    return entity
  }

  async getItems(options?: { authorId?: EntityId; localId?: EntityId }): Promise<T[]> {
    const keys = await this.storage.getAllKeys()

    const filteredKeys = keys.filter((key) => {
      const parsedId = BaseLocalRepository._parseGlobalId(key)
      if (!parsedId) return false
      if (options?.authorId && parsedId.authorId !== options.authorId) return false
      if (options?.localId && parsedId.localId !== options.localId) return false
      if (parsedId.type !== this._entityKey) return false
      return true
    })

    const items = await Promise.all(filteredKeys.map((id) => this.getItem({ id })))

    return items.filter((x) => x !== null)
  }

  async getItemsByIndex(entity: Partial<T>): Promise<T[]> {
    const items = await this.getItems()

    const filteredItems = items.filter((item) => {
      for (const prop in entity) {
        if (!isDeepEqual(entity[prop], item[prop])) return false
      }
      return true
    })

    return filteredItems
  }

  async createItem(item: T): Promise<T> {
    if (await this.getItem({ id: item.id })) {
      throw new Error('Item with that ID already exists')
    }

    await this.saveItem(item)

    // ToDo: update timestamp and blockNumber

    return item
  }

  async editItem(item: T): Promise<T> {
    if (!(await this.getItem({ id: item.id }))) {
      throw new Error('Item with that ID does not exist')
    }

    await this.saveItem(item)

    // ToDo: update timestamp and blockNumber

    return item
  }

  public async saveItem(item: T): Promise<T> {
    const json = await this.storage.getItem(item.id)

    const history: T[] = json ? JSON.parse(json) ?? [] : []

    history.push(item)

    await this.storage.setItem(item.id, JSON.stringify(history))

    return item
  }

  async deleteItem(id: EntityId): Promise<void> {
    await this.storage.removeItem(id)
  }

  async constructItem(
    item: Omit<T, keyof Base> & { metadata: EntityMetadata<EntityId> }
  ): Promise<T> {
    if (!item?.metadata?.name) {
      throw new Error('Metadata name is required')
    }

    const localId = BaseLocalRepository._normalizeNameToLocalId(item.metadata.name)

    // ToDo: magic value
    const authorId = null

    // @ts-ignore
    const entity: T = this.EntityType.create({
      ...item,
      localId,
      authorId,
      source: EntitySourceType.Local,
    })

    return entity
  }

  private static _parseGlobalId(globalId: EntityId): {
    authorId: string
    type: string
    localId: string
  } | null {
    if (globalId.split(KeyDelimiter).length !== 3) {
      return null
    }

    if (globalId.replaceAll(/[^a-zA-Z0-9_.\-\/]/g, '') !== globalId) {
      return null
    }

    const [authorId, type, localId] = globalId.split(KeyDelimiter)
    return { authorId, type, localId }
  }

  // ToDo: duplicate in base.repository.ts
  private static _normalizeNameToLocalId(name: string): string {
    // allow only alphanumeric
    return name.replace(/[^a-zA-Z0-9]/g, '')
  }
}
