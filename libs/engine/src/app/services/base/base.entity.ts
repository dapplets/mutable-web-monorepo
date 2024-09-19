import { getEntity } from './decorators/entity'

const KeyDelimiter = '/'

export type EntityId = string

export class Base {
  id: EntityId = ''

  get authorId(): string {
    return this.id.split(KeyDelimiter)[0]
  }

  set authorId(authorId: string) {
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

  // ToDo: add block number

  static create<T extends Base>(this: new () => T, data: Partial<T>): T {
    const instance = new this()
    Object.assign(instance, data)
    return instance
  }

  copy<T extends Base>(this: T, data: Partial<T>): T {
    const copyInstance = new (this.constructor as { new (): T })()
    Object.assign(copyInstance, this, data)
    return copyInstance
  }
}
