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
    return this._get(FAVORITE_MUTATION)
  }

  async setFavoriteMutation(mutationId: string | null | undefined): Promise<void> {
    return this._set(FAVORITE_MUTATION, mutationId)
  }

  async getMutationLastUsage(mutationId: string): Promise<string | null> {
    const key = this._makeKey(MUTATION_LAST_USAGE, mutationId)
    return (this._get(key) ?? null) as Promise<string | null>
  }

  async setMutationLastUsage(mutationId: string, value: string | null): Promise<void> {
    const key = this._makeKey(MUTATION_LAST_USAGE, mutationId)
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
