import { BaseCreateDto } from '../../base/base-create.dto'
import { NotificationType } from '../notification.entity'
import { RegularPayload } from '../types/regular'
import { PullRequestPayload } from '../types/pull-request'

export type NotificationCreateDto = BaseCreateDto & {
  type: NotificationType
  payload: RegularPayload | PullRequestPayload
  recipients: string[]
}
