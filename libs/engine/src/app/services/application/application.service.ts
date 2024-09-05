import { IContextNode } from '@mweb/core'
import { Mutation, MutationId } from '../mutation/mutation.entity'
import { TargetService } from '../target/target.service'
import { AppId, AppInstanceWithSettings, AppMetadata, AppWithSettings } from './application.entity'
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

  public async getAppWithSettings(
    mutationId: MutationId,
    appId: AppId
  ): Promise<AppWithSettings | null> {
    const app = await this.getApplication(appId)
    if (!app) return null

    return this.populateAppWithSettings(mutationId, app)
  }

  public async getAppsFromMutation(mutation: Mutation): Promise<AppInstanceWithSettings[]> {
    return Promise.all(
      mutation.apps.map((appInstance, index) =>
        this.getAppWithSettings(mutation.id, appInstance.appId).then((app) => ({
          ...app,
          instanceId: index.toString(), // index is used as instance id
          documentId: appInstance.documentId,
        }))
      )
    ).then((apps) => apps.filter((app) => app !== null) as AppInstanceWithSettings[])
  }

  public async getAppEnabledStatus(mutationId: MutationId, appId: AppId): Promise<boolean> {
    return this.applicationRepository.getAppEnabledStatus(mutationId, appId)
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

  public async enableAppInMutation(mutationId: MutationId, appId: AppId) {
    await this.applicationRepository.setAppEnabledStatus(mutationId, appId, true)
  }

  public async disableAppInMutation(mutationId: MutationId, appId: AppId) {
    await this.applicationRepository.setAppEnabledStatus(mutationId, appId, false)
  }

  public async populateAppWithSettings(
    mutationId: MutationId,
    app: AppMetadata
  ): Promise<AppWithSettings> {
    return {
      ...app,
      settings: {
        isEnabled: await this.applicationRepository.getAppEnabledStatus(mutationId, app.id),
      },
    }
  }
}
