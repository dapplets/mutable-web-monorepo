import { LocalDbService } from '../local-db/local-db.service'
import { SocialDbService } from '../social-db/social-db.service'
import { AppId, AppInstanceId, AppMetadata } from './application.entity'

// SocialDB
const ProjectIdKey = 'dapplets.near'
const SettingsKey = 'settings'
const SelfKey = ''
const AppKey = 'app'
const WildcardKey = '*'
const RecursiveWildcardKey = '**'
const KeyDelimiter = '/'

// LocalDB
const STOPPED_APPS = 'stopped-apps'

export class ApplicationRepository {
  constructor(
    private socialDb: SocialDbService,
    private localDb: LocalDbService
  ) {}

  async getApplication(globalAppId: AppId): Promise<AppMetadata | null> {
    const [authorId, , appLocalId] = globalAppId.split(KeyDelimiter)

    const keys = [authorId, SettingsKey, ProjectIdKey, AppKey, appLocalId]
    const queryResult = await this.socialDb.get([
      [...keys, RecursiveWildcardKey].join(KeyDelimiter),
    ])

    const app = SocialDbService.getValueByKey(keys, queryResult)

    if (!app?.[SelfKey]) return null

    const parsed = JSON.parse(app[SelfKey])

    return {
      id: globalAppId,
      appLocalId,
      authorId,
      metadata: app.metadata,
      controller: parsed.controller,
      parsers: parsed.parsers,
      targets: parsed.targets,
      permissions: {
        documents: parsed.permissions?.documents ?? false,
      },
    }
  }

  async getApplications(): Promise<AppMetadata[]> {
    const keys = [
      WildcardKey, // any author id
      SettingsKey,
      ProjectIdKey,
      AppKey,
      WildcardKey, // any app local id
    ]

    const queryResult = await this.socialDb.get([
      [...keys, RecursiveWildcardKey].join(KeyDelimiter),
    ])

    const appsByKey = SocialDbService.splitObjectByDepth(queryResult, keys.length)

    const apps = Object.entries(appsByKey).map(([key, app]: [string, any]) => {
      const [authorId, , , , appLocalId] = key.split(KeyDelimiter)
      const globalAppId = [authorId, AppKey, appLocalId].join(KeyDelimiter)

      const parsed = JSON.parse(app[SelfKey])

      return {
        id: globalAppId,
        appLocalId,
        authorId,
        metadata: app.metadata,
        controller: parsed.controller,
        parsers: parsed.parsers,
        targets: parsed.targets,
        permissions: {
          documents: parsed.permissions?.documents ?? false,
        },
      }
    })

    return apps
  }

  async saveApplication(
    appMetadata: Omit<AppMetadata, 'authorId' | 'appLocalId'>
  ): Promise<AppMetadata> {
    const [authorId, , appLocalId] = appMetadata.id.split(KeyDelimiter)

    const keys = [authorId, SettingsKey, ProjectIdKey, AppKey, appLocalId]

    const storedAppMetadata = {
      [SelfKey]: JSON.stringify({
        targets: appMetadata.targets,
        parsers: appMetadata.parsers,
        permissions: appMetadata.permissions,
      }),
      metadata: appMetadata.metadata,
    }

    await this.socialDb.set(SocialDbService.buildNestedData(keys, storedAppMetadata))

    return {
      ...appMetadata,
      appLocalId,
      authorId,
    }
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
