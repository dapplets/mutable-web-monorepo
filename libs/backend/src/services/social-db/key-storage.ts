import { KeyPair, keyStores } from 'near-api-js'
import { LocalDbService } from '../local-db/local-db.service'

const LOCAL_STORAGE_KEY_PREFIX = 'near-api-js:keystore:'

export class KeyStorage extends keyStores.KeyStore {
  private prefix: string

  constructor(
    private _storage: LocalDbService,
    keyStorePrefix?: string
  ) {
    super()
    this.prefix = keyStorePrefix ?? LOCAL_STORAGE_KEY_PREFIX
  }

  async setKey(networkId: string, accountId: string, keyPair: KeyPair): Promise<void> {
    const storageKey = this.storageKeyForSecretKey(networkId, accountId)
    await this._storage.setItem(storageKey, keyPair.toString())
    await this.registerStorageKey(storageKey)
  }

  async getKey(networkId: string, accountId: string): Promise<KeyPair> {
    const key = this.storageKeyForSecretKey(networkId, accountId)
    const result = await this._storage.getItem<string | null>(key)

    if (!result) {
      return null as any as KeyPair
    }

    return KeyPair.fromString(result)
  }

  async removeKey(networkId: string, accountId: string): Promise<void> {
    const storageKey = this.storageKeyForSecretKey(networkId, accountId)
    await this._storage.setItem(storageKey, undefined)
    await this.unregisterStorageKey(storageKey)
  }

  async clear(): Promise<void> {
    const keys = await this.storageKeys()
    for (const key of keys) {
      if (key.startsWith(this.prefix)) {
        await this._storage.setItem(key, undefined)
      }
    }

    await this._storage.setItem(this.storageKeyForStorageKeysArray(), undefined)
  }

  async getNetworks(): Promise<string[]> {
    const result = new Set<string>()
    const keys = await this.storageKeys()
    for (const key of keys) {
      if (key.startsWith(this.prefix)) {
        const parts = key.substring(this.prefix.length).split(':')
        result.add(parts[1])
      }
    }
    return Array.from(result.values())
  }

  async getAccounts(networkId: string): Promise<string[]> {
    const result = new Array<string>()
    const keys = await this.storageKeys()
    for (const key of keys) {
      if (key.startsWith(this.prefix)) {
        const parts = key.substring(this.prefix.length).split(':')
        if (parts[1] === networkId) {
          result.push(parts[0])
        }
      }
    }
    return result
  }

  private storageKeyForSecretKey(networkId: string, accountId: string): string {
    return `${this.prefix}${accountId}:${networkId}`
  }

  private storageKeyForStorageKeysArray(): string {
    return `${this.prefix}storagekeys`
  }

  private async storageKeys(): Promise<string[]> {
    return (await this._storage.getItem(this.storageKeyForStorageKeysArray())) ?? []
  }

  private async registerStorageKey(storageKey: string): Promise<void> {
    const storageKeysKey = this.storageKeyForStorageKeysArray()
    const allStorageKeys = (await this._storage.getItem<string[]>(storageKeysKey)) ?? []
    await this._storage.setItem(storageKeysKey, [...allStorageKeys, storageKey])
  }

  private async unregisterStorageKey(storageKey: string): Promise<void> {
    const storageKeysKey = this.storageKeyForStorageKeysArray()
    const allStorageKeys = (await this._storage.getItem<string[]>(storageKeysKey)) ?? []
    await this._storage.setItem(
      storageKeysKey,
      allStorageKeys.filter((key) => key !== storageKey)
    )
  }
}
