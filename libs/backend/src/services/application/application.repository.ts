import { BaseRepository } from '../base/base.repository'
import { LocalDbService } from '../local-db/local-db.service'
import { SocialDbService } from '../social-db/social-db.service'
import { AppInstanceId, AppMetadata } from './application.entity'

// SocialDB
const ProjectIdKey = 'dapplets.near'
const SettingsKey = 'settings'
const SelfKey = ''
const AppKey = 'app'
const KeyDelimiter = '/'

// LocalDB
const STOPPED_APPS = 'stopped-apps'

export class ApplicationRepository extends BaseRepository<AppMetadata> {
  constructor(
    socialDb: SocialDbService,
    private localDb: LocalDbService
  ) {
    super(AppMetadata, socialDb)
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
