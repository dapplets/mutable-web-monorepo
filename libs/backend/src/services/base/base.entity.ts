import { BaseDto } from './base.dto'
import { getEntity } from './decorators/entity'

const KeyDelimiter = '/'

export type EntityId = string

export enum EntitySourceType {
  Local = 'local',
  Origin = 'origin',
}

export class Base {
  id: EntityId = ''
  source: EntitySourceType = EntitySourceType.Local
  blockNumber: number = 0 // ToDo: fake block number
  timestamp: number = 0 // ToDo: fake timestamp

  get authorId(): string | null {
    return this.id.split(KeyDelimiter)[0] ?? null
  }

  set authorId(authorId: string | null) {
    this.id = [authorId, this.entityType, this.localId].join(KeyDelimiter)
  }

  get localId(): string {
    return this.id.split(KeyDelimiter)[2]
  }

  set localId(localId: string) {
    this.id = [this.authorId, this.entityType, localId].join(KeyDelimiter)
  }

  get entityType(): string {
    return getEntity(this.constructor).name
  }

  static create<T extends Base>(
    this: new () => T,
    data: Partial<T> & (Pick<Base, 'authorId' | 'localId'> | Pick<Base, 'id'>)
  ): T {
    const instance = new this()
    Object.assign(instance, data)
    if (data.authorId) instance.authorId = data.authorId // ToDo: hit fix: think of it
    return instance
  }

  copy<T extends Base>(this: T, data: Partial<T>): T {
    const copyInstance = new (this.constructor as { new (): T })()
    Object.assign(copyInstance, this, data)
    return copyInstance
  }

  toDto(): BaseDto {
    return {
      id: this.id,
      localId: this.localId,
      authorId: this.authorId,
      source: this.source,
      blockNumber: this.blockNumber,
      timestamp: this.timestamp,
    }
  }
}
