import { Base } from './base.entity'
import { SocialDbService, Value } from '../social-db/social-db.service'
import { getEntity } from './decorators/entity'
import { ColumnType, getColumn } from './decorators/column'
import { mergeDeep } from '../../common/merge-deep'

// ToDo: parametrize?
const ProjectIdKey = 'dapplets.near'
const SettingsKey = 'settings'

const WildcardKey = '*'
const RecursiveWildcardKey = '**'
const KeyDelimiter = '/'
const EmptyValue = ''
const SelfKey = ''

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

    // ToDo: out of gas
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

  async getItemsByIndex(entity: Partial<T>): Promise<T[]> {
    if (Object.keys(entity).length !== 1) {
      throw new Error('Only one index is supported')
    }

    const [propName, propValue] = Object.entries(entity)[0]

    const column = getColumn(this.EntityType.prototype, propName)

    if (!column) {
      throw new Error('Column not found')
    }

    const { name, type, transformer } = column

    if (type !== ColumnType.Set) {
      throw new Error('Only Set columns can be indexed')
    }

    const rawKey = name ?? propName // open_with

    if (propValue.length !== 1) {
      throw new Error('Only one value in Set is supported')
    }

    if (transformer) {
      throw new Error('Transformer is not implemented')
    }

    const [firstValue] = propValue

    const keys = [
      WildcardKey, // any author id
      SettingsKey,
      ProjectIdKey,
      this._entityKey,
      WildcardKey, // any document local id
      rawKey,
    ]

    // Set-specific logic:
    keys.push(...firstValue.split(KeyDelimiter))

    const foundKeys = await this.socialDb.keys([keys.join(KeyDelimiter)])

    const documentIds = foundKeys.map((key: string) => {
      const [authorId, , , , localId] = key.split(KeyDelimiter)
      return [authorId, this._entityKey, localId].join(KeyDelimiter)
    })

    const documents = await Promise.all(documentIds.map((id) => this.getItem(id))).then(
      (documents) => documents.filter((x) => x !== null)
    )

    return documents
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

    console.log('convert', { id, raw, entity })

    entity.id = id

    // for each property in the entity type get column metadata

    for (const entityKey in entity) {
      // ToDo: why prototype?
      const column = getColumn(this.EntityType.prototype, entityKey)

      if (!column) continue

      const { type, transformer, name } = column

      const rawKey = name ?? entityKey

      if (type === ColumnType.AsIs) {
        entity[entityKey] = transformer?.from ? transformer.from(raw[rawKey]) : raw[rawKey]
      } else if (type === ColumnType.Json) {
        const json = typeof raw[rawKey] === 'object' ? raw[rawKey][SelfKey] : raw[rawKey]

        entity[entityKey] = json
          ? transformer?.from
            ? transformer.from(JSON.parse(json))
            : JSON.parse(json)
          : entity[entityKey]
      } else if (type === ColumnType.Set) {
        entity[entityKey] = transformer?.from
          ? transformer.from(BaseRepository._makeSetFromSocialDb(raw[rawKey]))
          : BaseRepository._makeSetFromSocialDb(raw[rawKey])
      }
    }

    return entity
  }

  private _makeItemToSocialDb(entity: T): Value {
    const raw: Value = {}

    for (const entityKey in entity) {
      // ToDo: why prototype?
      const column = getColumn(this.EntityType.prototype, entityKey)

      if (!column) continue

      const { type, transformer, name } = column

      const rawKey = name ?? entityKey

      const transformedValue = transformer?.to
        ? transformer.to(entity[entityKey])
        : entity[entityKey]

      if (type === ColumnType.AsIs) {
        raw[rawKey] = transformedValue
      } else if (type === ColumnType.Json) {
        raw[rawKey] = JSON.stringify(transformedValue)
      } else if (type === ColumnType.Set) {
        raw[rawKey] = BaseRepository._makeSetToSocialDb(transformedValue)
      }
    }

    return raw
  }

  private _parseGlobalId(globalId: EntityId): { authorId: string; localId: string } {
    const [authorId, entityType, localId] = globalId.split(KeyDelimiter)

    if (entityType !== this._entityKey) {
      // ToDo: or null?
      throw new Error('Wrong entity type')
    }

    return { authorId, localId }
  }

  private static _makeSetFromSocialDb(raw: any): any {
    const depth = BaseRepository._objectDepth(raw)
    return Object.keys(SocialDbService.splitObjectByDepth(raw, depth))
  }

  private static _makeSetToSocialDb(arr: any[]): any {
    return mergeDeep(
      {},
      ...arr.map((el) => SocialDbService.buildNestedData(el.split(KeyDelimiter), EmptyValue))
    )
  }

  private static _objectDepth<T extends { [s: string]: T }>(o: { [s: string]: T }): number {
    return Object(o) === o
      ? 1 + Math.max(-1, ...Object.values(o).map((v) => BaseRepository._objectDepth(v)))
      : 0
  }
}
