import { StorageService } from '@near-wallet-selector/core'
import { IStorage } from '@mweb/backend'
import browser from 'webextension-polyfill'

export class ExtensionStorage implements StorageService, IStorage {
  constructor(private _keyPrefix: string) {}

  async getItem(key: string): Promise<string> {
    const globalKey = this._makeKey(key)
    const result = await browser.storage.local.get(globalKey)
    // @ts-ignore
    return result[globalKey]
  }

  async setItem(key: string, value: string): Promise<void> {
    await browser.storage.local.set({ [this._makeKey(key)]: value })
  }

  async removeItem(key: string): Promise<void> {
    await browser.storage.local.remove(this._makeKey(key))
  }

  async getAllKeys(): Promise<string[]> {
    const result = await browser.storage.local.get(null)
    return Object.keys(result)
      .filter((key) => key.startsWith(this._keyPrefix))
      .map((key) => key.substring(this._keyPrefix.length + 1))
  }

  private _makeKey(key: string): string {
    return this._keyPrefix + ':' + key
  }
}
