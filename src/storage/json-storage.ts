import { IStorage } from './storage'

export class JsonStorage {
  storage: IStorage

  constructor(storage: IStorage) {
    this.storage = storage
  }

  async getItem<Value>(key: string): Promise<Value | null> {
    const item = await this.storage.getItem(key)
    return typeof item === 'string' ? (JSON.parse(item) as Value) : null
  }

  async setItem<Value>(key: string, value: Value): Promise<void> {
    return this.storage.setItem(key, JSON.stringify(value))
  }

  async removeItem(key: string): Promise<void> {
    return this.storage.removeItem(key)
  }
}
