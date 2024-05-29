import { IStorage } from './storage'

export class LocalStorage implements IStorage {
  constructor(private _keyPrefix: string = 'mutableweb') {}

  async getItem(key: string): Promise<string | null> {
    return localStorage.getItem(this._makeKey(key))
  }

  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(this._makeKey(key), value)
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(this._makeKey(key))
  }

  private _makeKey(key: string): string {
    return this._keyPrefix + ':' + key
  }
}
