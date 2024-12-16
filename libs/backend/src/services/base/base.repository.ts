import serializeToDeterministicJson from 'json-stringify-deterministic'
import { Base, EntitySourceType } from './base.entity'
import { SocialDbService, Value } from '../social-db/social-db.service'
import { getEntity } from './decorators/entity'
import { ColumnType, getColumn } from './decorators/column'
import { mergeDeep } from '../../common/merge-deep'
import { Transaction } from '../unit-of-work/transaction'
import { EntityMetadata } from '../../common/entity-metadata'
import { IRepository } from './repository.interface'

// ToDo: parametrize?
const ProjectIdKey = 'dapplets.near'
const SettingsKey = 'settings'

const WildcardKey = '*'
const RecursiveWildcardKey = '**'
const KeyDelimiter = '/'
const EmptyValue = ''
const SelfKey = ''
const BlockNumberKey = ':block'
const TagsKey = 'tags'
const VersionsKey = 'versions'
const LatestTagName = 'latest'

// ToDo:
type EntityId = string

export class BaseRepository<T extends Base> implements IRepository<T> {
  private _entityKey: string
  private _isVersionedEntity: boolean

  constructor(
    private EntityType: { new (): T },
    public socialDb: SocialDbService
  ) {
    const { name, versioned } = getEntity(EntityType)
    this._entityKey = name
    this._isVersionedEntity = versioned ?? false // ToDo: move to the decorator
  }

  async getItem({ id, version }: { id: EntityId; version?: string }): Promise<T | null> {
    const { authorId, localId } = this._parseGlobalId(id)

    if (authorId === WildcardKey || localId === WildcardKey) {
      throw new Error('Wildcard is not supported')
    }

    if (this._isVersionedEntity) {
      version = version ?? (await this.getTagValue({ id, tag: LatestTagName })) ?? undefined
    }

    const baseKeys = [authorId, SettingsKey, ProjectIdKey, this._entityKey, localId]

    const allKeysForFetching: string[][] = []

    const columnNames = Object.getOwnPropertyNames(new this.EntityType())

    for (const columnName of columnNames) {
      // ToDo: why prototype?
      const column = getColumn(this.EntityType.prototype, columnName)

      if (!column) continue

      const { type, versioned, name } = column
      const rawColumnName = name ?? columnName

      // Scalar types should be queried without wildcard
      if (type === ColumnType.Json || type === ColumnType.AsIs) {
        if (versioned && version) {
          allKeysForFetching.push(baseKeys.concat([VersionsKey, version!, rawColumnName]))
          allKeysForFetching.push(baseKeys.concat([rawColumnName])) // backward compatibility
        } else {
          allKeysForFetching.push(baseKeys.concat([rawColumnName]))
        }
      }

      // Non-scalar types should be queried with wildcard
      if (type === ColumnType.Set || type === ColumnType.AsIs) {
        if (versioned && version) {
          allKeysForFetching.push(
            baseKeys.concat([VersionsKey, version!, rawColumnName, RecursiveWildcardKey])
          )
          allKeysForFetching.push(baseKeys.concat([rawColumnName, RecursiveWildcardKey])) // backward compatibility
        } else {
          allKeysForFetching.push(baseKeys.concat([rawColumnName, RecursiveWildcardKey]))
        }
      }
    }

    const queryResult = await this.socialDb.get(
      allKeysForFetching.map((keys) => keys.join(KeyDelimiter)),
      { withBlockHeight: true }
    )

    const nonVersionedData = SocialDbService.getValueByKey(baseKeys, queryResult)
    const versionedData = SocialDbService.getValueByKey(
      baseKeys.concat(VersionsKey, version!),
      queryResult
    )

    if (!nonVersionedData && !versionedData) return null

    const item = this._makeItemFromSocialDb(id, {
      ...nonVersionedData,
      [VersionsKey]: undefined, // remove key from nonVersionedData
      ...versionedData, // it overrides backward compatible props
      version,
    })

    return item
  }

  async getItems(options?: { authorId?: EntityId; localId?: EntityId }): Promise<T[]> {
    const authorId = options?.authorId ?? WildcardKey
    const localId = options?.localId ?? WildcardKey

    const keys = [authorId, SettingsKey, ProjectIdKey, this._entityKey, localId]

    // ToDo: out of gas
    const fetchedKeys = await this.socialDb.keys([keys.join(KeyDelimiter)])

    const itemKeys = fetchedKeys.map((key) => {
      const [authorId, , , , localId] = key.split(KeyDelimiter)
      return [authorId, this._entityKey, localId].join(KeyDelimiter)
    })

    const items = await Promise.all(itemKeys.map((id) => this.getItem({ id })))

    return items.filter((x) => x !== null)
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

    const { name, type, transformer, versioned } = column

    if (versioned) {
      throw new Error('Versioned columns are not supported for indexing')
    }

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

    const itemIds = foundKeys.map((key: string) => {
      const [authorId, , , , localId] = key.split(KeyDelimiter)
      return [authorId, this._entityKey, localId].join(KeyDelimiter)
    })

    const items = await Promise.all(itemIds.map((id) => this.getItem({ id }))).then((items) =>
      items.filter((x) => x !== null)
    )

    return items
  }

  async createItem(item: T, tx?: Transaction): Promise<T> {
    if (await this.getItem({ id: item.id })) {
      throw new Error('Item with that ID already exists')
    }

    return this.saveItem(item, tx)
  }

  async editItem(item: T, tx?: Transaction): Promise<T> {
    if (!(await this.getItem({ id: item.id }))) {
      throw new Error('Item with that ID does not exist')
    }

    return this.saveItem(item, tx)
  }

  public async saveItem(item: T, tx?: Transaction): Promise<T> {
    const [authorId, , localId] = item.id.split(KeyDelimiter)

    const keys = [authorId, SettingsKey, ProjectIdKey, this._entityKey, localId]

    if (this._isVersionedEntity) {
      // increment version
      const lastVersion = await this.getTagValue({ id: item.id, tag: LatestTagName })
      item.version = lastVersion ? (parseInt(lastVersion) + 1).toString() : '1'
    }

    const convertedItem = this._makeItemToSocialDb(item)
    const dataToSave = SocialDbService.buildNestedData(keys, convertedItem)
    await this._commitOrQueue(dataToSave, tx)

    // ToDo: add timestamp and blockNumber

    // @ts-ignore
    const entity: T = this.EntityType.create({
      ...item,
      localId,
      authorId,
      source: EntitySourceType.Origin,
    })

    return entity
  }

  async deleteItem(id: EntityId, tx?: Transaction): Promise<void> {
    const { authorId, localId } = this._parseGlobalId(id)

    const keys = [
      authorId,
      SettingsKey,
      ProjectIdKey,
      this._entityKey,
      localId,
      RecursiveWildcardKey, // delete all children
    ].join(KeyDelimiter)

    const data = await this.socialDb.get([keys])

    const nullData = SocialDbService._nullifyData(data)

    await this._commitOrQueue(nullData, tx)
  }

  // ToDo: move to Entity contstructor?
  async constructItem(
    item: Omit<T, keyof Base> & { metadata: EntityMetadata<EntityId> }
  ): Promise<T> {
    if (!item?.metadata?.name) {
      throw new Error('Metadata name is required')
    }

    const localId = BaseRepository._normalizeNameToLocalId(item.metadata.name)

    // ToDo: have to make signer public for it
    const authorId = await this.socialDb.signer.getAccountId()

    if (!authorId) {
      throw new Error('User is not logged in')
    }

    const id = [authorId, this._entityKey, localId].join(KeyDelimiter)

    // @ts-ignore
    const entity: T = this.EntityType.create({
      ...item,
      id,
      localId,
      authorId,
      source: EntitySourceType.Origin,
    })

    return entity
  }

  async getVersions({ id }: { id: EntityId }): Promise<string[]> {
    const { authorId, localId } = this._parseGlobalId(id)

    if (authorId === WildcardKey || localId === WildcardKey) {
      throw new Error('Wildcard is not supported')
    }

    const keys = [
      authorId,
      SettingsKey,
      ProjectIdKey,
      this._entityKey,
      localId,
      VersionsKey,
      WildcardKey,
    ]

    const foundKeys = await this.socialDb.keys([keys.join(KeyDelimiter)])

    return foundKeys.map((key: string) => key.split(KeyDelimiter).pop()!)
  }

  async getTagValue({ id, tag }: { id: EntityId; tag: string }): Promise<string | null> {
    const { authorId, localId } = this._parseGlobalId(id)

    if (authorId === WildcardKey || localId === WildcardKey) {
      throw new Error('Wildcard is not supported')
    }

    const keys = [authorId, SettingsKey, ProjectIdKey, this._entityKey, localId, TagsKey, tag]
    const queryResult = await this.socialDb.get([[...keys].join(KeyDelimiter)])

    const itemWithMeta = SocialDbService.getValueByKey(keys, queryResult)

    if (!itemWithMeta) return null

    return itemWithMeta
  }

  async getTags({ id }: { id: EntityId }): Promise<string[]> {
    const { authorId, localId } = this._parseGlobalId(id)

    if (authorId === WildcardKey || localId === WildcardKey) {
      throw new Error('Wildcard is not supported')
    }

    const keys = [
      authorId,
      SettingsKey,
      ProjectIdKey,
      this._entityKey,
      localId,
      TagsKey,
      WildcardKey,
    ]

    const foundKeys = await this.socialDb.keys([keys.join(KeyDelimiter)])

    return foundKeys
  }

  private async _commitOrQueue(dataToSave: Value, tx?: Transaction) {
    if (tx) {
      tx.queue(dataToSave)
    } else {
      await this.socialDb.set(dataToSave)
    }
  }

  private _makeItemFromSocialDb(id: EntityId, rawWithMeta: Value): T {
    const raw = BaseRepository._clearObjectFromMeta(rawWithMeta)
    const entity = new this.EntityType()

    entity.id = id
    entity.blockNumber = rawWithMeta[BlockNumberKey]
    entity.source = EntitySourceType.Origin
    entity.version = rawWithMeta.version ?? '0' // ToDo: fake version

    // ToDo: calculate it like localId and authorId?
    entity.timestamp = this.socialDb.getTimestampByBlockHeight(entity.blockNumber)

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
    const raw: Value = this._isVersionedEntity
      ? {
          [VersionsKey]: { [entity.version]: {} },
          [TagsKey]: { [LatestTagName]: entity.version },
        }
      : {}

    for (const entityKey in entity) {
      // ToDo: why prototype?
      const column = getColumn(this.EntityType.prototype, entityKey)

      if (!column) continue

      const { type, transformer, name, versioned } = column

      const rawKey = name ?? entityKey

      const transformedValue = transformer?.to
        ? transformer.to(entity[entityKey])
        : entity[entityKey]

      let rawValue: any = null

      if (type === ColumnType.AsIs) {
        rawValue = transformedValue
      } else if (type === ColumnType.Json) {
        rawValue = serializeToDeterministicJson(transformedValue)
      } else if (type === ColumnType.Set) {
        rawValue = BaseRepository._makeSetToSocialDb(transformedValue)
      }

      if (versioned) {
        raw[VersionsKey][entity.version][rawKey] = rawValue
      } else {
        raw[rawKey] = rawValue
      }
    }

    return raw
  }

  private _parseGlobalId(globalId: EntityId): { authorId: string; localId: string } {
    if (!globalId) {
      throw new Error(`Invalid entity ID: ${globalId}`)
    }

    const [authorId, entityType, localId] = globalId.split(KeyDelimiter)

    if (entityType !== this._entityKey) {
      // ToDo: or null?
      throw new Error(
        `Wrong entity type. Expected: ${this._entityKey}, received: ${entityType}. Global ID: ${globalId}`
      )
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

  private static _removeBlockKeys(obj: Value): Value {
    return typeof obj === 'object'
      ? Object.fromEntries(
          Object.entries(obj)
            .filter(([key]) => key !== BlockNumberKey)
            .map(([key, value]) => [key, this._removeBlockKeys(value)])
        )
      : obj
  }

  private static _replaceEmptyKeyWithValue(obj: Value): Value {
    if (!obj || typeof obj !== 'object') return obj
    if (Object.keys(obj).length === 1 && SelfKey in obj) return obj[SelfKey]
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, this._replaceEmptyKeyWithValue(value)])
    )
  }

  private static _clearObjectFromMeta(obj: Value): Value {
    return this._replaceEmptyKeyWithValue(this._removeBlockKeys(obj))
  }

  private static _normalizeNameToLocalId(name: string): string {
    // allow only alphanumeric
    return name.replace(/[^a-zA-Z0-9]/g, '')
  }
}
