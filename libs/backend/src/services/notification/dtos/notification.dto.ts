import { BaseDto } from '../../base/base.dto'
import { NotificationType } from '../notification.entity'
import { NotificationStatus } from '../resolution.entity'
import { PullRequestPayload, PullRequestResult } from '../types/pull-request'
import { PullRequestAcceptedPayload } from '../types/pull-request-accepted'
import { PullRequestRejectedPayload } from '../types/pull-request-rejected'
import { RegularPayload } from '../types/regular'

export type NotificationDto = BaseDto & {
  type: NotificationType
  payload:
    | RegularPayload
    | PullRequestPayload
    | PullRequestAcceptedPayload
    | PullRequestRejectedPayload
    | null
  recipients: string[]
  status: NotificationStatus
  result: PullRequestResult | null
}
