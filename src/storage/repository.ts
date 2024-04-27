import { JsonStorage } from './json-storage'

const KEY_DELIMITER = ':'
const FAVORITE_MUTATION = 'favorite-mutation'
const MUTATION_LAST_USAGE = 'mutation-last-usage'

export class Repository {
  jsonStorage: JsonStorage

  constructor(jsonStorage: JsonStorage) {
    this.jsonStorage = jsonStorage
  }

  async getFavoriteMutation(): Promise<string | null | undefined> {
    const key = this._makeKey(FAVORITE_MUTATION, window.location.hostname)
    return this._get(key)
  }

  async setFavoriteMutation(mutationId: string | null | undefined): Promise<void> {
    const key = this._makeKey(FAVORITE_MUTATION, window.location.hostname)
    return this._set(key, mutationId)
  }

  async getMutationLastUsage(mutationId: string, hostname: string): Promise<string | null> {
    const key = this._makeKey(MUTATION_LAST_USAGE, mutationId, hostname)
    return (this._get(key) ?? null) as Promise<string | null>
  }

  async setMutationLastUsage(
    mutationId: string,
    value: string | null,
    hostname: string
  ): Promise<void> {
    const key = this._makeKey(MUTATION_LAST_USAGE, mutationId, hostname)
    return this._set(key, value)
  }

  private async _get<Value>(key: string): Promise<Value | null | undefined>
  private async _get<Value>(key: string, defaultValue: Value | null): Promise<Value | null>
  private async _get<Value>(
    key: string,
    defaultValue: Value | null = null
  ): Promise<Value | null | undefined> {
    const value = await this.jsonStorage.getItem<Value>(key)
    return value === null ? defaultValue : value
  }

  private async _set<Value>(key: string, value: Value | null | undefined): Promise<void> {
    await this.jsonStorage.setItem(key, value)
  }

  private _makeKey(...keys: string[]): string {
    return keys.join(KEY_DELIMITER)
  }
}
