import { IContextNode } from '@mweb/core'
import { TargetService } from '../target/target.service'
import { Mutation, MutationId, MutationWithSettings } from './mutation.entity'
import { Transaction } from '../unit-of-work/transaction'
import { UnitOfWorkService } from '../unit-of-work/unit-of-work.service'
import { NotificationService } from '../notification/notification.service'
import { NotificationType } from '../notification/notification.entity'
import { PullRequestPayload } from '../notification/types/pull-request'
import { EntityId, EntitySourceType } from '../base/base.entity'
import { NotificationDto } from '../notification/dtos/notification.dto'
import { MutationDto } from './dtos/mutation.dto'
import { MutationCreateDto } from './dtos/mutation-create.dto'
import { NotificationCreateDto } from '../notification/dtos/notification-create.dto'
import { IRepository } from '../base/repository.interface'
import { SettingsSerivce } from '../settings/settings.service'
import { NearSigner } from '../near-signer/near-signer.service'

export type SaveMutationOptions = {
  applyChangesToOrigin?: boolean
  askOriginToApplyChanges?: boolean
}

export class MutationService {
  constructor(
    private mutationRepository: IRepository<Mutation>,
    private settingsService: SettingsSerivce,
    private notificationService: NotificationService,
    private unitOfWorkService: UnitOfWorkService,
    private nearConfig: { defaultMutationId: string },
    private nearSigner: NearSigner
  ) {}

  async getMutation(
    mutationId: string,
    source?: EntitySourceType,
    version?: string
  ): Promise<MutationDto | null> {
    const mutation = await this.mutationRepository.getItem({ id: mutationId, source, version })
    return mutation?.toDto() ?? null
  }

  async getMutationVersions(mutationId: string): Promise<{ version: string }[]> {
    const versions = await this.mutationRepository.getVersions({
      id: mutationId,
      source: EntitySourceType.Origin,
    })
    return versions.map((v) => ({ version: v }))
  }

  async getMutationsForContext(context: IContextNode): Promise<MutationDto[]> {
    const mutations = await this.mutationRepository.getItems()
    return mutations
      .filter((mutation) =>
        mutation.targets.some((target) => TargetService.isTargetMet(target, context))
      )
      .map((mutation) => mutation.toDto())
  }

  async getMutationsWithSettings(context: IContextNode): Promise<MutationWithSettings[]> {
    const mutations = await this.getMutationsForContext(context)

    return Promise.all(mutations.map((mut) => this.populateMutationWithSettings(mut)))
  }

  getLastUsedMutation = async (context: IContextNode): Promise<string | null> => {
    const hostname = window.location.hostname
    const mutationsUsage = await this.settingsService.getAllMutationsLastUsage(hostname)

    const usedMutationsData = mutationsUsage
      .filter((m) => m.lastUsage)
      .map((m) => ({ id: m.mutationId, lastUsage: new Date(m.lastUsage!).getTime() }))

    if (usedMutationsData?.length) {
      if (usedMutationsData.length === 1) return usedMutationsData[0].id
      let lastMutation = usedMutationsData[0]
      for (let i = 1; i < usedMutationsData.length; i++) {
        if (usedMutationsData[i].lastUsage > lastMutation.lastUsage) {
          lastMutation = usedMutationsData[i]
        }
      }
      return lastMutation.id
    } else {
      // Activate default mutation for new users
      return this.nearConfig.defaultMutationId
    }
  }

  async setFavoriteMutation(mutationId: string | null): Promise<void> {
    return this.settingsService.setFavoriteMutation(mutationId)
  }

  async getFavoriteMutation(): Promise<string | null> {
    const value = await this.settingsService.getFavoriteMutation()
    return value ?? null
  }

  async getPreferredSource(mutationId: string): Promise<EntitySourceType | null> {
    const value = await this.settingsService.getPreferredSource(mutationId)
    return value ?? null
  }

  async getMutationVersion(mutationId: string): Promise<string | null> {
    const value = await this.settingsService.getMutationVersion(mutationId)
    return value ?? null
  }

  async setMutationVersion(mutationId: string, version: string | null = null): Promise<void> {
    return this.settingsService.setMutationVersion(mutationId, version)
  }

  async setPreferredSource(mutationId: string, source: EntitySourceType | null): Promise<void> {
    return this.settingsService.setPreferredSource(mutationId, source)
  }

  async createMutation(
    dto: MutationCreateDto,
    options: SaveMutationOptions = {
      applyChangesToOrigin: false,
      askOriginToApplyChanges: false,
    }
  ): Promise<MutationWithSettings> {
    const { applyChangesToOrigin, askOriginToApplyChanges } = options

    const mutation = await this._fixMutationErrors(await this.mutationRepository.constructItem(dto))

    if (mutation.source === EntitySourceType.Origin) {
      await this.unitOfWorkService.runInTransaction((tx) =>
        Promise.all([
          this.mutationRepository.createItem(mutation, tx),
          applyChangesToOrigin && this._applyChangesToOrigin(mutation, tx),
          askOriginToApplyChanges && this._askOriginToApplyChanges(mutation, tx),
        ])
      )
    } else if (mutation.source === EntitySourceType.Local) {
      await this.mutationRepository.createItem(mutation)
    } else {
      throw new Error('Invalid entity source')
    }

    return this.populateMutationWithSettings(mutation.toDto())
  }

  async editMutation(
    dto: MutationDto,
    options: SaveMutationOptions = {
      applyChangesToOrigin: false,
      askOriginToApplyChanges: false,
    },
    tx?: Transaction
  ): Promise<MutationWithSettings> {
    const { applyChangesToOrigin, askOriginToApplyChanges } = options

    const mutation = await this._fixMutationErrors(Mutation.create(dto))

    // ToDo: move to provider?
    if (!(await this.mutationRepository.getItem({ id: mutation.id }))) {
      throw new Error('Mutation with that ID does not exist')
    }

    if (mutation.source === EntitySourceType.Origin) {
      const performTx = (tx: Transaction) =>
        Promise.all([
          this.mutationRepository.editItem(mutation, tx),
          applyChangesToOrigin && this._applyChangesToOrigin(mutation, tx),
          askOriginToApplyChanges && this._askOriginToApplyChanges(mutation, tx),
        ])

      // reuse transaction
      if (tx) {
        await performTx(tx)
      } else {
        await this.unitOfWorkService.runInTransaction(performTx)
      }
    } else if (mutation.source === EntitySourceType.Local) {
      await this.mutationRepository.editItem(mutation, tx)
    } else {
      throw new Error('Invalid entity source')
    }

    return this.populateMutationWithSettings(mutation.toDto())
  }

  async saveMutation(
    dto: MutationCreateDto | MutationDto,
    options: SaveMutationOptions = {
      applyChangesToOrigin: false,
      askOriginToApplyChanges: false,
    },
    tx?: Transaction
  ): Promise<MutationWithSettings> {
    const { applyChangesToOrigin, askOriginToApplyChanges } = options

    const mutation = await this._fixMutationErrors(
      'id' in dto ? Mutation.create(dto) : await this.mutationRepository.constructItem(dto)
    )

    if (mutation.source === EntitySourceType.Origin) {
      const performTx = (tx: Transaction) =>
        Promise.all([
          this.mutationRepository.saveItem(mutation, tx),
          applyChangesToOrigin && this._applyChangesToOrigin(mutation, tx),
          askOriginToApplyChanges && this._askOriginToApplyChanges(mutation, tx),
        ])

      // reuse transaction
      if (tx) {
        await performTx(tx)
      } else {
        await this.unitOfWorkService.runInTransaction(performTx)
      }
    } else if (mutation.source === EntitySourceType.Local) {
      await this.mutationRepository.saveItem(mutation, tx)
    } else {
      throw new Error('Invalid entity source')
    }

    return this.populateMutationWithSettings(mutation.toDto())
  }

  async deleteMutation(mutationId: EntityId): Promise<void> {
    await this.mutationRepository.deleteItem(mutationId)
  }

  async acceptPullRequest(notificationId: EntityId): Promise<NotificationDto> {
    const notification = await this.notificationService.getNotification(notificationId)

    if (!notification) {
      throw new Error('Notification not found')
    }

    if (notification.type !== NotificationType.PullRequest) {
      throw new Error('Notification is not a pull request')
    }

    const { sourceMutationId, targetMutationId } = notification.payload as PullRequestPayload

    const sourceMutation = await this.mutationRepository.getItem({ id: sourceMutationId })

    if (!sourceMutation) {
      throw new Error('Source mutation not found')
    }

    if (sourceMutation.metadata.fork_of !== targetMutationId) {
      throw new Error('Source mutation is not fork of target mutation')
    }

    const [, freshNotification] = await this.unitOfWorkService.runInTransaction((tx) =>
      Promise.all([
        this._applyChangesToOrigin(sourceMutation, tx),
        this.notificationService.acceptNotification(notificationId, tx),
      ])
    )

    return freshNotification
  }

  async rejectPullRequest(notificationId: EntityId): Promise<NotificationDto> {
    return this.notificationService.rejectNotification(notificationId)
  }

  async removeMutationFromRecents(mutationId: MutationId): Promise<void> {
    await this.settingsService.setMutationLastUsage(mutationId, null, window.location.hostname)
  }

  public async updateMutationLastUsage(mutationId: MutationId, hostname: string): Promise<string> {
    // save last usage
    const currentDate = new Date().toISOString()
    await this.settingsService.setMutationLastUsage(mutationId, currentDate, hostname)
    return currentDate
  }

  async getMutationWithSettings(
    mutationId: string,
    source?: EntitySourceType,
    version?: string
  ): Promise<MutationWithSettings | null> {
    const mutation = await this.getMutation(mutationId, source, version)
    return mutation ? this.populateMutationWithSettings(mutation) : null
  }

  public async populateMutationWithSettings(mutation: MutationDto): Promise<MutationWithSettings> {
    const lastUsage = await this.settingsService.getMutationLastUsage(
      mutation.id,
      window.location.hostname
    )
    const preferredSource = await this.settingsService.getPreferredSource(mutation.id)
    const selectedVersion = await this.settingsService.getMutationVersion(mutation.id)

    // ToDo: do not mix MutationWithSettings and Mutation
    return { ...mutation, settings: { lastUsage, preferredSource, selectedVersion } }
  }

  private async _applyChangesToOrigin(forkedMutation: Mutation, tx?: Transaction) {
    const originalMutationId = forkedMutation.metadata.fork_of

    if (!originalMutationId) {
      throw new Error('The mutation is not a fork and does not have an origin to apply changes to')
    }

    const originalMutation = await this.mutationRepository.getItem({ id: originalMutationId })

    if (!originalMutation) {
      throw new Error('The origin mutation does not exist')
    }

    // apply changes to origin
    originalMutation.apps = forkedMutation.apps
    originalMutation.metadata.description = forkedMutation.metadata.description
    originalMutation.targets = forkedMutation.targets

    await this.mutationRepository.editItem(originalMutation, tx)

    return originalMutation
  }

  private async _askOriginToApplyChanges(forkedMutation: Mutation, tx?: Transaction) {
    const originalMutationId = forkedMutation.metadata.fork_of

    if (!originalMutationId) {
      throw new Error('The mutation is not a fork and does not have an origin to apply changes to')
    }

    const originalMutation = await this.mutationRepository.getItem({ id: originalMutationId })

    if (!originalMutation) {
      throw new Error('The origin mutation does not exist')
    }

    const { authorId: forkAuthorId } = forkedMutation
    const { authorId: originAuthorId } = originalMutation

    if (!originAuthorId || !forkAuthorId) {
      throw new Error('The mutation does not have an author')
    }

    // ToDo: check logged in user id?
    if (forkAuthorId === originAuthorId) {
      throw new Error('You cannot ask yourself to apply changes')
    }

    const notification: NotificationCreateDto = {
      source: EntitySourceType.Origin,
      type: NotificationType.PullRequest,
      recipients: [originAuthorId],
      payload: {
        sourceMutationId: forkedMutation.id,
        targetMutationId: originalMutation.id,
      },
    }

    await this.notificationService.createNotification(notification, tx)
  }

  private async _fixMutationErrors(mutation: Mutation): Promise<Mutation> {
    if (mutation.source === EntitySourceType.Local) {
      return mutation
    }

    const accountId = await this.nearSigner.getAccountId()

    mutation.apps = mutation.apps.map((app) => {
      if (!app.documentId) return app

      const [docAuthorId, , localDocId] = app.documentId.split('/')

      if (docAuthorId) return app

      return {
        appId: app.appId,
        documentId: `${accountId}/document/${localDocId}`,
      }
    })

    return mutation
  }
}
