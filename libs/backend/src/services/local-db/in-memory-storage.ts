import { IStorage } from './local-storage'

export class InMemoryStorage implements IStorage {
  _state = new Map<string, string>()

  async getItem(key: string): Promise<string | null> {
    return this._state.get(key) ?? null
  }

  async setItem(key: string, value: string): Promise<void> {
    this._state.set(key, value)
  }

  async removeItem(key: string): Promise<void> {
    this._state.delete(key)
  }

  async getAllKeys(): Promise<string[]> {
    return Array.from(this._state.keys())
  }
}
