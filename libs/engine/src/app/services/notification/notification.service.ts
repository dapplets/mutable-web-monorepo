import { EntityId } from '../base/base.entity'
import { NearSigner } from '../near-signer/near-signer.service'
import { Transaction } from '../unit-of-work/transaction'
import { UserLinkService } from '../user-link/user-link.service'
import { Notification, NotificationType } from './notification.entity'
import { NotificationRepository } from './notification.repository'
import { NotificationStatus, Resolution } from './resolution.entity'
import { ResolutionRepository } from './resolution.repository'
import { NotificationDto } from './dtos/notification.dto'
import { NotificationCreateDto } from './dtos/notification-create.dto'
import { PullRequestStatus } from './types/pull-request'
import { UnitOfWorkService } from '../unit-of-work/unit-of-work.service'
import { generateGuid } from '../../common/generate-guid'

export class NotificationService {
  constructor(
    private notificationRepository: NotificationRepository,
    private resolutionRepository: ResolutionRepository,
    private unitOfWorkService: UnitOfWorkService,
    private nearSigner: NearSigner
  ) {}

  // ToDo: return dto
  async getNotification(notificationId: string): Promise<Notification | null> {
    return this.notificationRepository.getItem(notificationId)
  }

  async createNotification(dto: NotificationCreateDto, tx?: Transaction): Promise<void> {
    const authorId = await this.nearSigner.getAccountId()
    if (!authorId) {
      throw new Error('Near account is not signed in')
    }

    const localId = generateGuid()

    const notification = Notification.create({ ...dto, authorId, localId })
    await this.notificationRepository.createItem(notification, tx)
  }

  // ToDo: move DTOs to controllers?

  async getNotificationsByRecipient(recipientId: string): Promise<NotificationDto[]> {
    const notifications = await this.notificationRepository.getItemsByIndex({
      recipients: [recipientId],
    })

    const resolutions = await Promise.all(
      notifications.map((notification) =>
        this._getResolutionForNotification(notification.id, notification.type, recipientId)
      )
    )

    return notifications.map((notification, i) => {
      const resolution = resolutions[i]
      return this._toDto(notification, resolution)
    })
  }

  async viewNotification(notificationId: EntityId, tx?: Transaction): Promise<NotificationDto> {
    return this._resolveNotificationById(
      notificationId,
      (resolution) => {
        if (resolution.status === NotificationStatus.Viewed) {
          throw new Error('Notification is already viewed')
        }

        resolution.status = NotificationStatus.Viewed
      },
      tx
    )
  }

  async viewAllNotifcations(recipientId: string): Promise<NotificationDto[]> {
    const notifications = await this.getNotificationsByRecipient(recipientId)

    const notificationsToBeViewed = notifications.filter(
      (notification) => notification.status === NotificationStatus.New
    )

    const markNotificationAsViewed = (resolution: Resolution) => {
      resolution.status = NotificationStatus.Viewed
    }

    return this.unitOfWorkService.runInTransaction((tx) =>
      Promise.all(
        notificationsToBeViewed.map((notification) =>
          this._resolveNotificationById(notification.id, markNotificationAsViewed, tx)
        )
      )
    )
  }

  async hideNotification(notificationId: EntityId, tx?: Transaction): Promise<NotificationDto> {
    return this._resolveNotificationById(
      notificationId,
      (resolution) => {
        if (resolution.status === NotificationStatus.Hidden) {
          throw new Error('Notification is already hidden')
        }

        resolution.status = NotificationStatus.Hidden
      },
      tx
    )
  }

  async acceptNotification(notificationId: EntityId, tx?: Transaction): Promise<NotificationDto> {
    return this._resolveNotificationById(
      notificationId,
      (resolution, notification) => {
        if (notification.type !== NotificationType.PullRequest) {
          throw new Error('Notification is not a pull request')
        }

        if (resolution.status === NotificationStatus.Hidden) {
          throw new Error('Notification is hidden')
        }

        if (
          resolution.result?.status === PullRequestStatus.Accepted ||
          resolution.result?.status === PullRequestStatus.Rejected
        ) {
          throw new Error('Notification has already been resolved')
        }

        // ToDo: check resolution.result

        resolution.status = NotificationStatus.Viewed
        resolution.result = { status: PullRequestStatus.Accepted }
      },
      tx
    )
  }

  async rejectNotification(notificationId: EntityId, tx?: Transaction): Promise<NotificationDto> {
    return this._resolveNotificationById(
      notificationId,
      (resolution, notification) => {
        if (notification.type !== NotificationType.PullRequest) {
          throw new Error('Notification is not a pull request')
        }

        if (resolution.status === NotificationStatus.Hidden) {
          throw new Error('Notification is hidden')
        }

        if (
          resolution.result?.status === PullRequestStatus.Accepted ||
          resolution.result?.status === PullRequestStatus.Rejected
        ) {
          throw new Error('Notification has already been resolved')
        }

        resolution.status = NotificationStatus.Viewed
        resolution.result = { status: PullRequestStatus.Rejected }
      },
      tx
    )
  }

  private async _resolveNotificationById(
    notificationId: EntityId,
    callback: (resolution: Resolution, notification: Notification) => void,
    tx?: Transaction
  ) {
    const notification = await this.notificationRepository.getItem(notificationId)

    if (!notification) {
      throw new Error('Notification not found')
    }

    return this._resolveNotification(notification, callback, tx)
  }

  private async _resolveNotification(
    notification: Notification,
    callback: (resolution: Resolution, notification: Notification) => void,
    tx?: Transaction
  ) {
    const accountId = await this.nearSigner.getAccountId()

    if (!accountId) {
      throw new Error('Not logged in')
    }

    if (!notification.recipients.includes(accountId)) {
      throw new Error('You are not a recipient of this notification')
    }

    const resolution = await this._getResolutionForNotification(
      notification.id,
      notification.type,
      accountId
    )

    callback(resolution, notification)

    await this.resolutionRepository.saveItem(resolution, tx)

    // ToDo: use mappers or move to entity method
    return this._toDto(notification, resolution)
  }

  private async _getResolutionForNotification(
    notificationId: EntityId,
    notificationType: NotificationType,
    accountId: string
  ): Promise<Resolution> {
    const hash = UserLinkService._hashString(notificationId)
    const resolutionId = `${accountId}/resolution/${hash}`

    const resolution = await this.resolutionRepository.getItem(resolutionId)

    if (resolution) return resolution

    // ToDo: refactor to add new notifcation type simply
    // ToDo: split to separate methods?

    switch (notificationType) {
      case NotificationType.PullRequest:
        return Resolution.create({
          id: resolutionId,
          status: NotificationStatus.New,
          result: { status: PullRequestStatus.Open },
        })

      case NotificationType.Regular:
      default:
        return Resolution.create({
          id: resolutionId,
          status: NotificationStatus.New,
        })
    }
  }

  private _toDto(notification: Notification, resolution: Resolution): NotificationDto {
    return {
      id: notification.id,
      localId: notification.localId,
      authorId: notification.authorId,
      blockNumber: notification.blockNumber,
      timestamp: notification.timestamp,
      type: notification.type,
      payload: notification.payload,
      recipients: notification.recipients,
      result: resolution.result,
      status: resolution.status,
    }
  }
}
