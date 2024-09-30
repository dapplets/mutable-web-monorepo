import { Base } from '../base/base.entity'
import { Entity } from '../base/decorators/entity'
import { Column, ColumnType } from '../base/decorators/column'
import { RegularPayload } from './types/regular'
import { PullRequestPayload } from './types/pull-request'
import { Resolution } from './resolution.entity'
import { NotificationDto } from './dtos/notification.dto'

export enum NotificationType {
  Regular = 'regular',
  PullRequest = 'pull-request',
  Unknown = 'unknown', // ToDo: workaround to construct Notification
}

@Entity({ name: 'notification' })
export class Notification extends Base {
  @Column()
  type: NotificationType = NotificationType.Unknown

  @Column({ type: ColumnType.Json })
  payload: RegularPayload | PullRequestPayload | null = null

  @Column({ type: ColumnType.Set })
  recipients: string[] = []
}
