import { IContextNode } from '../../../../core'
import { MutationId } from '../mutation/mutation.entity'
import { TargetService } from '../target/target.service'
import { AppId, AppMetadata, AppWithSettings } from './application.entity'
import { ApplicationRepository } from './application.repository'

export class ApplicationService {
  constructor(private applicationRepository: ApplicationRepository) {}

  public getApplications(): Promise<AppMetadata[]> {
    return this.applicationRepository.getApplications()
  }

  public getApplication(appId: AppId): Promise<AppMetadata | null> {
    return this.applicationRepository.getApplication(appId)
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
