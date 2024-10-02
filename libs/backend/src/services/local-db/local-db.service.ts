import { IStorage } from './local-storage'

const KEY_DELIMITER = ':'

/**
 * ToDo: rename to DataSource
 */
export class LocalDbService {
  storage: IStorage

  constructor(storage: IStorage) {
    this.storage = storage
  }

  async getItem<Value>(key: string): Promise<Value | null | undefined> {
    const item = await this.storage.getItem(key)
    return typeof item === 'string' ? (JSON.parse(item) as Value) : undefined
  }

  async setItem<Value>(key: string, value: Value | null | undefined): Promise<void> {
    const serializedValue = JSON.stringify(value)

    if (typeof serializedValue === 'undefined') {
      return this.storage.removeItem(key)
    } else {
      return this.storage.setItem(key, JSON.stringify(value))
    }
  }

  public static makeKey(...keys: string[]): string {
    return keys.join(KEY_DELIMITER)
  }
}
