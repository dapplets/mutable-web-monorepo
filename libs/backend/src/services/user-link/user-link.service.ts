import serializeToDeterministicJson from 'json-stringify-deterministic'
import { sha256 } from 'js-sha256'
import { IContextNode } from '@mweb/core'
import {
  AppId,
  AppInstanceWithSettings,
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
  IndexedLink,
  LinkIndexObject,
  UserLinkId,
} from './user-link.entity'
import { UserLinkRepository } from './user-link.repository'
import { NearSigner } from '../near-signer/near-signer.service'
import { generateGuid } from '../../common/generate-guid'

// ToDo: is in the entity
const LinkKey = 'link'
const KeyDelimiter = '/'

export class UserLinkService {
  constructor(
    private userLinkRepository: UserLinkRepository,
    private applicationService: ApplicationService,
    private _signer: NearSigner // ToDo: is it necessary dependency injection?
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
    const accountId = await this._signer.getAccountId()

    if (!accountId) throw new Error('User is not logged in')

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

    const indexObject = UserLinkService._buildLinkIndex(app.id, mutationId, target, context)
    const index = UserLinkService._hashObject(indexObject)

    // ToDo: this limitation on the frontend side only
    if (target.injectOnce) {
      const existingLinks = await this.userLinkRepository.getItemsByIndex({ indexes: [index] })
      if (existingLinks.length > 0) {
        throw new Error(
          `The widget is injected already. The "injectOnce" parameter limits multiple insertion of widgets`
        )
      }
    }

    const linkId = generateGuid()

    const indexedLink = IndexedLink.create({
      id: [accountId, LinkKey, linkId].join(KeyDelimiter),
      indexes: [index],
    })

    await this.userLinkRepository.createItem(indexedLink)

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
    return this.userLinkRepository.deleteItem(userLinkId)
  }

  // #endregion

  // #region Private

  private async _getUserLinksForTarget(
    mutationId: string,
    appId: string,
    target: AppMetadataTarget,
    context: IContextNode
  ): Promise<BosUserLink[]> {
    const indexObject = UserLinkService._buildLinkIndex(appId, mutationId, target, context)
    const index = UserLinkService._hashObject(indexObject)
    const indexedLinks = await this.userLinkRepository.getItemsByIndex({ indexes: [index] })

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

  /**
   * Hashes object using deterministic serializator, SHA-256 and base64url encoding
   */
  static _hashObject(obj: any): string {
    const json = serializeToDeterministicJson(obj)
    return this._hashString(json)
  }

  /**
   * Hashes string using SHA-256 and base64url encoding
   */
  static _hashString(str: string): string {
    const hashBytes = sha256.create().update(str).arrayBuffer()
    return this._base64EncodeURL(hashBytes)
  }

  /**
   * Source: https://gist.github.com/themikefuller/c1de46cbbdad02645b9dc006baedf88e
   */
  static _base64EncodeURL(byteArray: ArrayLike<number> | ArrayBufferLike): string {
    return btoa(
      Array.from(new Uint8Array(byteArray))
        .map((val) => {
          return String.fromCharCode(val)
        })
        .join('')
    )
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/\=/g, '')
  }

  // #endregion
}
