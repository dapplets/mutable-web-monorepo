import { IContextNode } from '@mweb/core'
import {
  AppId,
  AppInstanceWithSettings,
  AppMetadata,
  AppMetadataTarget,
} from '../application/application.entity'
import { ApplicationService } from '../application/application.service'
import { MutationId } from '../mutation/mutation.entity'
import { ScalarType, TargetCondition } from '../target/target.entity'
import { TargetService } from '../target/target.service'
import {
  BosUserLink,
  BosUserLinkWithInstance,
  ControllerLink,
  LinkIndexObject,
  UserLinkId,
} from './user-link.entity'
import { UserLinkRepository } from './user-link.repository'

export class UserLinkSerivce {
  constructor(
    private userLinkRepository: UserLinkRepository,
    private applicationService: ApplicationService
  ) {}

  // ToDo: replace with getAppsAndLinksForContext
  async getLinksForContext(
    appsToCheck: AppInstanceWithSettings[],
    mutationId: MutationId,
    context: IContextNode
  ): Promise<BosUserLinkWithInstance[]> {
    const promises: Promise<BosUserLinkWithInstance[]>[] = []

    for (const app of appsToCheck) {
      const suitableTargets = app.targets.filter((target) =>
        TargetService.isTargetMet(target, context)
      )

      // ToDo: batch requests
      suitableTargets.forEach((target) => {
        promises.push(
          this._getUserLinksForTarget(mutationId, app.id, target, context).then((links) => {
            return links.map((link) => ({ ...link, appInstanceId: app.instanceId }))
          })
        )
      })
    }

    const appLinksNested = await Promise.all(promises)

    return appLinksNested.flat(2)
  }

  getStaticLinksForApps(
    appsToCheck: AppInstanceWithSettings[],
    context: IContextNode
  ): BosUserLinkWithInstance[] {
    return appsToCheck.flatMap((app) =>
      app.targets
        .filter((target) => target.static)
        .filter((target) => TargetService.isTargetMet(target, context))
        .map((target, i) => ({
          id: `${app.id}/${i}`, // ToDo: id
          appId: app.id,
          namespace: target.namespace,
          insertionPoint: target.injectTo,
          bosWidgetId: target.componentId,
          authorId: app.authorId,
          static: true,
          appInstanceId: app.instanceId,
        }))
    )
  }

  getControllersForApps(
    appsToCheck: AppInstanceWithSettings[],
    context: IContextNode
  ): ControllerLink[] {
    return appsToCheck
      .filter((app) => app.controller)
      .flatMap((app) =>
        app.targets
          .filter((target) => TargetService.isTargetMet(target, context))
          .map((_, i) => ({
            id: `${app.id}/${app.instanceId}/${i}`, // ToDo: id
            appId: app.id,
            appInstanceId: app.instanceId,
            bosWidgetId: app.controller!, // ! - because it's filtered above
          }))
      )
  }

  async createLink(
    mutationId: MutationId,
    appGlobalId: AppId,
    context: IContextNode
  ): Promise<BosUserLink> {
    const app = await this.applicationService.getApplication(appGlobalId)

    if (!app) {
      throw new Error('App not found')
    }

    const suitableTargets = app.targets.filter((target) =>
      TargetService.isTargetMet(target, context)
    )

    if (suitableTargets.length === 0) {
      throw new Error('No suitable targets found')
    }

    if (suitableTargets.length > 1) {
      throw new Error('More than one suitable targets found')
    }

    const [target] = suitableTargets

    const indexObject = UserLinkSerivce._buildLinkIndex(app.id, mutationId, target, context)

    // ToDo: this limitation on the frontend side only
    if (target.injectOnce) {
      const existingLinks = await this.userLinkRepository.getLinksByIndex(indexObject)
      if (existingLinks.length > 0) {
        throw new Error(
          `The widget is injected already. The "injectOnce" parameter limits multiple insertion of widgets`
        )
      }
    }

    const indexedLink = await this.userLinkRepository.createLink(indexObject)

    return {
      id: indexedLink.id,
      appId: appGlobalId,
      namespace: target.namespace,
      authorId: indexedLink.authorId,
      bosWidgetId: target.componentId,
      insertionPoint: target.injectTo,
      static: false,
    }
  }

  async deleteUserLink(userLinkId: UserLinkId): Promise<void> {
    return this.userLinkRepository.deleteUserLink(userLinkId)
  }

  // #endregion

  // #region Private

  private async _getUserLinksForTarget(
    mutationId: string,
    appId: string,
    target: AppMetadataTarget,
    context: IContextNode
  ): Promise<BosUserLink[]> {
    const indexObject = UserLinkSerivce._buildLinkIndex(appId, mutationId, target, context)
    const indexedLinks = await this.userLinkRepository.getLinksByIndex(indexObject)

    return indexedLinks.map((link) => ({
      id: link.id,
      appId: appId,
      authorId: link.authorId,
      namespace: target.namespace,
      bosWidgetId: target.componentId, // ToDo: unify
      insertionPoint: target.injectTo, // ToDo: unify
      static: false,
    }))
  }

  // #region Utils

  static _buildLinkIndex(
    appId: AppId,
    mutationId: MutationId,
    target: AppMetadataTarget,
    context: IContextNode
  ): LinkIndexObject {
    const indexedContextData = this._buildIndexedContextValues(target.if, context.parsedContext)

    return {
      appId,
      mutationId,
      namespace: target.namespace,
      contextType: target.contextType,
      if: indexedContextData,
    }
  }

  static _buildIndexedContextValues(
    conditions: Record<string, TargetCondition>,
    values: Record<string, ScalarType>
  ): Record<string, ScalarType> {
    const object: Record<string, ScalarType> = {}

    for (const property in conditions) {
      if (conditions[property].index) {
        object[property] = values[property]
      }
    }

    return object
  }

  // #endregion
}
