import { IContextNode } from '@mweb/core'
import { TargetService } from '../target/target.service'
import { Mutation, MutationId, MutationWithSettings } from './mutation.entity'
import { MutationRepository } from './mutation.repository'
import { Transaction } from '../unit-of-work/transaction'
import { UnitOfWorkService } from '../unit-of-work/unit-of-work.service'
import { NotificationService } from '../notification/notification.service'
import { NotificationType } from '../notification/notification.entity'
import { PullRequestPayload } from '../notification/types/pull-request'
import { generateGuid } from '../../common/generate-guid'
import { EntityId } from '../base/base.entity'
import { NotificationDto } from '../notification/dtos/notification.dto'
import { MutationDto } from './dtos/mutation.dto'
import { MutationCreateDto } from './dtos/mutation-create.dto'
import { NotificationCreateDto } from '../notification/dtos/notification-create.dto'

export type SaveMutationOptions = {
  applyChangesToOrigin?: boolean
  askOriginToApplyChanges?: boolean
}

export class MutationService {
  constructor(
    private mutationRepository: MutationRepository,
    private notificationService: NotificationService,
    private unitOfWorkService: UnitOfWorkService,
    private nearConfig: { defaultMutationId: string }
  ) {}

  async getMutation(mutationId: string): Promise<MutationDto | null> {
    const mutation = await this.mutationRepository.getItem(mutationId)
    return mutation?.toDto() ?? null
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
    const allMutations = await this.getMutationsWithSettings(context)
    const hostname = window.location.hostname
    const lastUsedData = await Promise.all(
      allMutations.map(async (m) => ({
        id: m.id,
        lastUsage: await this.mutationRepository.getMutationLastUsage(m.id, hostname),
      }))
    )
    const usedMutationsData = lastUsedData
      .filter((m) => m.lastUsage)
      .map((m) => ({ id: m.id, lastUsage: new Date(m.lastUsage!).getTime() }))

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
    return this.mutationRepository.setFavoriteMutation(mutationId)
  }

  async getFavoriteMutation(): Promise<string | null> {
    const value = await this.mutationRepository.getFavoriteMutation()
    return value ?? null
  }

  async createMutation(
    dto: MutationCreateDto,
    options: SaveMutationOptions = {
      applyChangesToOrigin: false,
      askOriginToApplyChanges: false,
    }
  ): Promise<MutationWithSettings> {
    const { applyChangesToOrigin, askOriginToApplyChanges } = options

    const mutation = await this.mutationRepository.constructItem(dto)

    // ToDo: move to provider?
    if (await this.mutationRepository.getItem(mutation.id)) {
      throw new Error('Mutation with that ID already exists')
    }

    await this.unitOfWorkService.runInTransaction((tx) =>
      Promise.all([
        this.mutationRepository.createItem(mutation, tx),
        applyChangesToOrigin && this._applyChangesToOrigin(mutation, tx),
        askOriginToApplyChanges && this._askOriginToApplyChanges(mutation, tx),
      ])
    )

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

    const mutation = Mutation.create(dto)

    // ToDo: move to provider?
    if (!(await this.mutationRepository.getItem(mutation.id))) {
      throw new Error('Mutation with that ID does not exist')
    }

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

    return this.populateMutationWithSettings(mutation.toDto())
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

    const sourceMutation = await this.mutationRepository.getItem(sourceMutationId)

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
    await this.mutationRepository.setMutationLastUsage(mutationId, null, window.location.hostname)
  }

  public async updateMutationLastUsage(mutationId: MutationId, hostname: string): Promise<string> {
    // save last usage
    const currentDate = new Date().toISOString()
    await this.mutationRepository.setMutationLastUsage(mutationId, currentDate, hostname)
    return currentDate
  }

  public async populateMutationWithSettings(mutation: MutationDto): Promise<MutationWithSettings> {
    const lastUsage = await this.mutationRepository.getMutationLastUsage(
      mutation.id,
      window.location.hostname
    )

    // ToDo: do not mix MutationWithSettings and Mutation
    return { ...mutation, settings: { lastUsage } }
  }

  private async _applyChangesToOrigin(forkedMutation: Mutation, tx?: Transaction) {
    const originalMutationId = forkedMutation.metadata.fork_of

    if (!originalMutationId) {
      throw new Error('The mutation is not a fork and does not have an origin to apply changes to')
    }

    const originalMutation = await this.mutationRepository.getItem(originalMutationId)

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

    const originalMutation = await this.mutationRepository.getItem(originalMutationId)

    if (!originalMutation) {
      throw new Error('The origin mutation does not exist')
    }

    const { authorId: forkAuthorId } = forkedMutation
    const { authorId: originAuthorId } = originalMutation

    // ToDo: check logged in user id?
    if (forkAuthorId === originAuthorId) {
      throw new Error('You cannot ask yourself to apply changes')
    }

    const notification: NotificationCreateDto = {
      type: NotificationType.PullRequest,
      recipients: [originAuthorId],
      payload: {
        sourceMutationId: forkedMutation.id,
        targetMutationId: originalMutation.id,
      },
    }

    await this.notificationService.createNotification(notification, tx)
  }
}
