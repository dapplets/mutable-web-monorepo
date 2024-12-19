import { AppInstanceId } from '../application/application.entity'
import { LocalDbService } from '../local-db/local-db.service'

// Local DB
const FAVORITE_MUTATION = 'favorite-mutation'
const MUTATION_LAST_USAGE = 'mutation-last-usage'
const STOPPED_APPS = 'stopped-apps'

export class SettingsSerivce {
  constructor(private localDb: LocalDbService) {}

  async getFavoriteMutation(): Promise<string | null | undefined> {
    const key = LocalDbService.makeKey(FAVORITE_MUTATION, window.location.hostname)
    return this.localDb.getItem(key)
  }

  async setFavoriteMutation(mutationId: string | null | undefined): Promise<void> {
    const key = LocalDbService.makeKey(FAVORITE_MUTATION, window.location.hostname)
    return this.localDb.setItem(key, mutationId)
  }

  async getMutationLastUsage(mutationId: string, hostname: string): Promise<string | null> {
    const key = LocalDbService.makeKey(MUTATION_LAST_USAGE, mutationId, hostname)
    return (await this.localDb.getItem(key)) ?? null
  }

  async setMutationLastUsage(
    mutationId: string,
    value: string | null,
    hostname: string
  ): Promise<void> {
    const key = LocalDbService.makeKey(MUTATION_LAST_USAGE, mutationId, hostname)
    return this.localDb.setItem(key, value)
  }

  async getAppEnabledStatus(mutationId: string, appInstanceId: AppInstanceId): Promise<boolean> {
    const key = LocalDbService.makeKey(STOPPED_APPS, mutationId, appInstanceId)
    return (await this.localDb.getItem(key)) ?? true // app is active by default
  }

  async setAppEnabledStatus(
    mutationId: string,
    appInstanceId: AppInstanceId,
    isEnabled: boolean
  ): Promise<void> {
    const key = LocalDbService.makeKey(STOPPED_APPS, mutationId, appInstanceId)
    return this.localDb.setItem(key, isEnabled)
  }
}
