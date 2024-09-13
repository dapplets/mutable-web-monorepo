import { IContextNode } from '@mweb/core'
import { AppInMutation, Mutation, MutationId } from '../mutation/mutation.entity'
import { TargetService } from '../target/target.service'
import {
  AppId,
  AppInstanceId,
  AppInstanceSettings,
  AppInstanceWithSettings,
  AppMetadata,
  AppWithSettings,
} from './application.entity'
import { ApplicationRepository } from './application.repository'

export class ApplicationService {
  constructor(private applicationRepository: ApplicationRepository) {}

  public getApplications(): Promise<AppMetadata[]> {
    // ToDo: out of gas
    return this.applicationRepository.getApplications()
  }

  public getApplication(appId: AppId): Promise<AppMetadata | null> {
    return this.applicationRepository.getApplication(appId)
  }

  public async getAppsFromMutation(mutation: Mutation): Promise<AppInstanceWithSettings[]> {
    return Promise.all(
      mutation.apps.map((appInstance) => this._getAppInstanceWithSettings(mutation.id, appInstance))
    ).then((apps) => apps.filter((app) => app !== null) as AppInstanceWithSettings[])
  }

  public filterSuitableApps(appsToCheck: AppMetadata[], context: IContextNode): AppMetadata[] {
    const suitableApps: AppMetadata[] = []

    for (const app of appsToCheck) {
      const suitableTargets = app.targets.filter((target) =>
        TargetService.isTargetMet(target, context)
      )

      if (suitableTargets.length > 0) {
        suitableApps.push({ ...app, targets: suitableTargets })
      }
    }

    return suitableApps
  }

  public async enableAppInstanceInMutation(mutationId: MutationId, appInstanceId: AppInstanceId) {
    await this.applicationRepository.setAppEnabledStatus(mutationId, appInstanceId, true)
  }

  public async disableAppInstanceInMutation(mutationId: MutationId, appInstanceId: AppInstanceId) {
    await this.applicationRepository.setAppEnabledStatus(mutationId, appInstanceId, false)
  }

  public static constructAppInstanceId({ appId, documentId }: AppInMutation): AppInstanceId {
    // ToDo: instance id is a concatenation of app id and document id
    return documentId ? `${appId}/${documentId}` : appId
  }

  private async _getAppInstanceWithSettings(mutationId: MutationId, appInstance: AppInMutation) {
    const instanceId = ApplicationService.constructAppInstanceId(appInstance)

    const [app, settings] = await Promise.all([
      this.getApplication(appInstance.appId),
      this._getAppInstanceSettings(mutationId, instanceId),
    ])

    if (!app) return null

    const appWithSettings: AppWithSettings = { ...app, settings }

    return {
      ...appWithSettings,
      instanceId,
      documentId: appInstance.documentId,
    }
  }

  private async _getAppInstanceSettings(
    mutationId: MutationId,
    appInstanceId: AppInstanceId
  ): Promise<AppInstanceSettings> {
    return {
      isEnabled: await this.applicationRepository.getAppEnabledStatus(mutationId, appInstanceId),
    }
  }
}
