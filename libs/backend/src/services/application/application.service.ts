import { IContextNode } from '@mweb/core'
import { AppInMutation, MutationId } from '../mutation/mutation.entity'
import { TargetService } from '../target/target.service'
import {
  AppId,
  AppInstanceId,
  AppInstanceSettings,
  AppInstanceWithSettings,
  AppWithSettings,
  AppMetadata,
} from './application.entity'
import { ApplicationDto } from './dtos/application.dto'
import { MutationDto } from '../mutation/dtos/mutation.dto'
import { ApplicationCreateDto } from './dtos/application-create.dto'
import { Transaction } from '../unit-of-work/transaction'
import { IRepository } from '../base/repository.interface'
import { SettingsSerivce } from '../settings/settings.service'

export class ApplicationService {
  constructor(
    private applicationRepository: IRepository<AppMetadata>,
    private settingsService: SettingsSerivce
  ) {}

  public async getApplications(): Promise<ApplicationDto[]> {
    // ToDo: out of gas
    const apps = await this.applicationRepository.getItems()
    return apps.map((app) => app.toDto())
  }

  public async getApplication(appId: AppId): Promise<ApplicationDto | null> {
    const app = await this.applicationRepository.getItem({ id: appId })
    return app?.toDto() ?? null
  }

  public async getAppsFromMutation(mutation: MutationDto): Promise<AppInstanceWithSettings[]> {
    return Promise.all(
      mutation.apps.map((appInstance) => this._getAppInstanceWithSettings(mutation.id, appInstance))
    ).then((apps) => apps.filter((app) => app !== null) as AppInstanceWithSettings[])
  }

  async createApplication(dto: ApplicationCreateDto, tx?: Transaction): Promise<ApplicationDto> {
    const app = await this.applicationRepository.constructItem(dto)
    return this.applicationRepository.createItem(app, tx)
  }

  public filterSuitableApps(
    appsToCheck: ApplicationDto[],
    context: IContextNode
  ): ApplicationDto[] {
    const suitableApps: ApplicationDto[] = []

    for (const app of appsToCheck) {
      const suitableTargets = app.targets.filter((target) =>
        TargetService.isTargetMet(target, context)
      )

      if (suitableTargets.length > 0) {
        // ToDo: this modifies the original array
        app.targets = suitableTargets
        suitableApps.push(app)
      }
    }

    return suitableApps
  }

  public async enableAppInstanceInMutation(mutationId: MutationId, appInstanceId: AppInstanceId) {
    await this.settingsService.setAppEnabledStatus(mutationId, appInstanceId, true)
  }

  public async disableAppInstanceInMutation(mutationId: MutationId, appInstanceId: AppInstanceId) {
    await this.settingsService.setAppEnabledStatus(mutationId, appInstanceId, false)
  }

  public static constructAppInstanceId({ appId, documentId }: AppInMutation): AppInstanceId {
    // ToDo: instance id is a concatenation of app id and document id
    return documentId ? `${appId}/${documentId}` : appId
  }

  private async _getAppInstanceWithSettings(mutationId: MutationId, appInstance: AppInMutation) {
    const instanceId = ApplicationService.constructAppInstanceId(appInstance)

    // ToDo: local or remote?
    const [app, settings] = await Promise.all([
      this.getApplication(appInstance.appId),
      this._getAppInstanceSettings(mutationId, instanceId),
    ])

    if (!app) return null

    const appWithSettings: any = app

    // ToDo: this modifies the original object
    appWithSettings.settings = settings
    appWithSettings.instanceId = instanceId
    appWithSettings.documentId = appInstance.documentId

    return app as AppWithSettings
  }

  private async _getAppInstanceSettings(
    mutationId: MutationId,
    appInstanceId: AppInstanceId
  ): Promise<AppInstanceSettings> {
    return {
      isEnabled: await this.settingsService.getAppEnabledStatus(mutationId, appInstanceId),
    }
  }
}
