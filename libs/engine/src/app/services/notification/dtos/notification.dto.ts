import { BaseDto } from '../../base/base.dto'
import { NotificationType } from '../notification.entity'
import { NotificationStatus } from '../resolution.entity'
import { PullRequestPayload, PullRequestResult } from '../types/pull-request'
import { RegularPayload } from '../types/regular'

export type NotificationDto = BaseDto & {
  type: NotificationType
  payload: RegularPayload | PullRequestPayload | null
  recipients: string[]
  status: NotificationStatus
  result: PullRequestResult | null
}
