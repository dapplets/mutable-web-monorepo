import { Base } from '../base/base.entity'
import { Entity } from '../base/decorators/entity'
import { Column, ColumnType } from '../base/decorators/column'
import { RegularPayload } from './types/regular'
import { PullRequestPayload } from './types/pull-request'
import { PullRequestAcceptedPayload } from './types/pull-request-accepted'
import { PullRequestRejectedPayload } from './types/pull-request-rejected'

export enum NotificationType {
  Regular = 'regular',
  PullRequest = 'pull-request',
  PullRequestAccepted = 'pull-request-accepted',
  PullRequestRejected = 'pull-request-rejected',
  Unknown = 'unknown', // ToDo: workaround to construct Notification
}

@Entity({ name: 'notification' })
export class Notification extends Base {
  @Column()
  type: NotificationType = NotificationType.Unknown

  @Column({ type: ColumnType.Json })
  payload:
    | RegularPayload
    | PullRequestPayload
    | PullRequestAcceptedPayload
    | PullRequestRejectedPayload
    | null = null

  @Column({ type: ColumnType.Set })
  recipients: string[] = []
}
