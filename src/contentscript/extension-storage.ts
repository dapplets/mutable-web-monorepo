import { StorageService } from '@near-wallet-selector/core'
import browser from 'webextension-polyfill'

export class ExtensionStorage implements StorageService {
  async getItem(key: string): Promise<string> {
    const result = await browser.storage.local.get(key)
    return result[key]
  }

  async setItem(key: string, value: string): Promise<void> {
    await browser.storage.local.set({ [key]: value })
  }

  async removeItem(key: string): Promise<void> {
    await browser.storage.local.remove(key)
  }
}
