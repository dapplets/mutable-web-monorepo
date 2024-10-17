import { BaseCreateDto } from '../../base/base-create.dto'
import { NotificationType } from '../notification.entity'
import { RegularPayload } from '../types/regular'
import { PullRequestPayload } from '../types/pull-request'
import { PullRequestAcceptedPayload } from '../types/pull-request-accepted'
import { PullRequestRejectedPayload } from '../types/pull-request-rejected'

export type NotificationCreateDto = BaseCreateDto & {
  type: NotificationType
  payload:
    | RegularPayload
    | PullRequestPayload
    | PullRequestAcceptedPayload
    | PullRequestRejectedPayload
  recipients: string[]
}
