const KeyDelimiter = '/'

export type EntityId = string

export class Base {
  id: EntityId = ''

  get authorId(): string {
    return this.id.split(KeyDelimiter)[0]
  }

  get localId(): string {
    return this.id.split(KeyDelimiter)[2]
  }

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
