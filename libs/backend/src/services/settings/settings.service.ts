import { AppInstanceId } from '../application/application.entity'
import { EntitySourceType } from '../base/base.entity'
import { EventService } from '../event/event.service'
import { LocalDbService } from '../local-db/local-db.service'

// Local DB
const FAVORITE_MUTATION = 'favorite-mutation'
const PREFERRED_SOURCE = 'preferred-source'
const MUTATION_LAST_USAGE = 'mutation-last-usage'
const STOPPED_APPS = 'stopped-apps'
const MUTATION_VERSION = 'mutation-version'

export type SettingsEvents = {
  favoriteMutationChanged: { contextId: string; mutationId: string | null | undefined }
  preferredSourceChanged: { contextId: string; mutationId: string; source: EntitySourceType | null }
  mutationVersionChanged: { mutationId: string; version: string | null }
  appEnabledStatusChanged: { mutationId: string; appInstanceId: AppInstanceId; isEnabled: boolean }
  mutationLastUsageChanged: { contextId: string; mutationId: string; value: string | null }
}

export class SettingsSerivce {
  constructor(
    private eventService: EventService<SettingsEvents>,
    private localDb: LocalDbService
  ) {}

  async getFavoriteMutation(contextId: string): Promise<string | null | undefined> {
    const key = LocalDbService.makeKey(FAVORITE_MUTATION, contextId)
    return this.localDb.getItem(key)
  }

  async setFavoriteMutation(
    contextId: string,
    mutationId: string | null | undefined
  ): Promise<void> {
    const key = LocalDbService.makeKey(FAVORITE_MUTATION, contextId)
    await this.localDb.setItem(key, mutationId)
    this.eventService.emit('favoriteMutationChanged', { mutationId, contextId })
  }

  async getPreferredSource(
    mutationId: string,
    contextId: string
  ): Promise<EntitySourceType | null> {
    const key = LocalDbService.makeKey(PREFERRED_SOURCE, mutationId, contextId)
    return (await this.localDb.getItem(key)) ?? null
  }

  async setPreferredSource(
    mutationId: string,
    contextId: string,
    source: EntitySourceType | null
  ): Promise<void> {
    const key = LocalDbService.makeKey(PREFERRED_SOURCE, mutationId, contextId)
    await this.localDb.setItem(key, source)
    this.eventService.emit('preferredSourceChanged', { mutationId, contextId, source })
  }

  async getMutationLastUsage(mutationId: string, contextId: string): Promise<string | null> {
    const key = LocalDbService.makeKey(MUTATION_LAST_USAGE, mutationId, contextId)
    return (await this.localDb.getItem(key)) ?? null
  }

  async setMutationLastUsage(
    mutationId: string,
    contextId: string,
    value: string | null
  ): Promise<void> {
    const key = LocalDbService.makeKey(MUTATION_LAST_USAGE, mutationId, contextId)
    await this.localDb.setItem(key, value)
    this.eventService.emit('mutationLastUsageChanged', { mutationId, contextId, value })
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
    await this.localDb.setItem(key, isEnabled)
    this.eventService.emit('appEnabledStatusChanged', {
      mutationId,
      appInstanceId,
      isEnabled,
    })
  }

  async getMutationVersion(mutationId: string): Promise<string | null> {
    const key = LocalDbService.makeKey(MUTATION_VERSION, mutationId)
    return (await this.localDb.getItem(key)) ?? null
  }

  async setMutationVersion(mutationId: string, version: string | null = null): Promise<void> {
    const key = LocalDbService.makeKey(MUTATION_VERSION, mutationId)
    await this.localDb.setItem(key, version)
    this.eventService.emit('mutationVersionChanged', { mutationId, version })
  }
}
