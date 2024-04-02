import { JsonStorage } from './json-storage'

const FAVORITE_MUTATIONS = 'favorite-mutations'

const DEFAULT_VALUES = {
  [FAVORITE_MUTATIONS]: [],
}

type Keys = keyof typeof DEFAULT_VALUES

export class Repository {
  jsonStorage: JsonStorage

  constructor(jsonStorage: JsonStorage) {
    this.jsonStorage = jsonStorage
  }

  async getFavoriteMutations(): Promise<string[]> {
    return this._get(FAVORITE_MUTATIONS)
  }

  async setFavoriteMutations(mutations: string[]): Promise<void> {
    return this._set(FAVORITE_MUTATIONS, mutations)
  }

  private async _get<Value>(key: Keys): Promise<Value> {
    const value = await this.jsonStorage.getItem<Value>(key)
    return value !== null ? value : (DEFAULT_VALUES[key] as Value)
  }

  private async _set<Value>(key: Keys, value: Value | null): Promise<void> {
    await this.jsonStorage.setItem(key, value)
  }
}
