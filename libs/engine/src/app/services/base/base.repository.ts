import { Base } from './base.entity'
import { SocialDbService, Value } from '../social-db/social-db.service'
import { getEntity } from './decorators/entity'
import { ColumnType, getColumn } from './decorators/column'

// ToDo: parametrize?
const ProjectIdKey = 'dapplets.near'
const SettingsKey = 'settings'

const WildcardKey = '*'
const RecursiveWildcardKey = '**'
const KeyDelimiter = '/'

// ToDo:
type EntityId = string

export class BaseRepository<T extends Base> {
  private _entityKey: string

  constructor(
    private EntityType: { new (): T },
    public socialDb: SocialDbService
  ) {
    this._entityKey = getEntity(EntityType).name
  }

  async getItem(id: EntityId): Promise<T | null> {
    const { authorId, localId } = this._parseGlobalId(id)

    const keys = [authorId, SettingsKey, ProjectIdKey, this._entityKey, localId]
    const queryResult = await this.socialDb.get([
      [...keys, RecursiveWildcardKey].join(KeyDelimiter),
    ])

    const item = SocialDbService.getValueByKey(keys, queryResult)

    if (!item) return null

    return this._makeItemFromSocialDb(id, item)
  }

  async getItems(): Promise<T[]> {
    const keys = [
      WildcardKey, // any author id
      SettingsKey,
      ProjectIdKey,
      this._entityKey,
      WildcardKey, // any item local id
    ]

    const queryResult = await this.socialDb.get([
      [...keys, RecursiveWildcardKey].join(KeyDelimiter),
    ])

    const mutationsByKey = SocialDbService.splitObjectByDepth(queryResult, keys.length)

    const items = Object.entries(mutationsByKey).map(([key, item]: [string, any]) => {
      const [accountId, , , , localMutationId] = key.split(KeyDelimiter)
      const itemId = [accountId, this._entityKey, localMutationId].join(KeyDelimiter)
      return this._makeItemFromSocialDb(itemId, item)
    })

    return items
  }

  async createItem(item: T): Promise<T> {
    if (await this.getItem(item.id)) {
      throw new Error('Item with that ID already exists')
    }

    return this._saveItem(item)
  }

  async editItem(item: T): Promise<T> {
    if (!(await this.getItem(item.id))) {
      throw new Error('Item with that ID does not exist')
    }

    return this._saveItem(item)
  }

  private async _saveItem(item: T): Promise<T> {
    const [authorId, , localId] = item.id.split(KeyDelimiter)

    const keys = [authorId, SettingsKey, ProjectIdKey, this._entityKey, localId]

    const convertedItem = this._makeItemToSocialDb(item)

    return SocialDbService.buildNestedData(keys, convertedItem)
  }

  private _makeItemFromSocialDb(id: EntityId, raw: Value): T {
    const entity = new this.EntityType()

    entity.id = id

    // for each property in the entity type get column metadata

    for (const key in entity) {
      // ToDo: why prototype?
      const column = getColumn(this.EntityType.prototype, key)

      if (!column) continue

      const { type, transformer } = column

      if (type === ColumnType.AsIs) {
        entity[key] = raw[key]
      } else if (type === ColumnType.Json) {
        entity[key] = raw[key] ? JSON.parse(raw[key]) : entity[key]
      }

      if (transformer?.from) {
        entity[key] = transformer.from(entity[key])
      }
    }

    console.log('convert', { id, raw, entity })

    return entity
  }

  private _makeItemToSocialDb(item: T): Value {
    const out: Value = {}

    for (const key in item) {
      // ToDo: why prototype?
      const column = getColumn(this.EntityType.prototype, key)

      if (!column) continue

      const { type, transformer } = column

      if (type === ColumnType.AsIs) {
        out[key] = item[key]
      } else if (type === ColumnType.Json) {
        out[key] = JSON.stringify(item[key])
      }

      if (transformer?.to) {
        out[key] = transformer.to(out[key])
      }
    }

    return out
  }

  private _parseGlobalId(globalId: EntityId): { authorId: string; localId: string } {
    const [authorId, entityType, localId] = globalId.split(KeyDelimiter)

    if (entityType !== this._entityKey) {
      // ToDo: or null?
      throw new Error('Wrong entity type')
    }

    return { authorId, localId }
  }
}
