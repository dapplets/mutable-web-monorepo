import { StorageService } from '@near-wallet-selector/core'
import { IStorage } from '@mweb/backend'
import browser from 'webextension-polyfill'

export class ExtensionStorage implements StorageService, IStorage {
  constructor(private _keyPrefix: string) {}

  async getItem(key: string): Promise<string> {
    const globalKey = this._makeKey(key)
    const result = await browser.storage.local.get(globalKey)
    return result[globalKey]
  }

  async setItem(key: string, value: string): Promise<void> {
    await browser.storage.local.set({ [this._makeKey(key)]: value })
  }

  async removeItem(key: string): Promise<void> {
    await browser.storage.local.remove(this._makeKey(key))
  }

  private _makeKey(key: string): string {
    return this._keyPrefix + ':' + key
  }
}
