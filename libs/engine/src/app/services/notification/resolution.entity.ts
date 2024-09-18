import { Base } from '../base/base.entity'
import { Entity } from '../base/decorators/entity'
import { Column, ColumnType } from '../base/decorators/column'
import { PullRequestResult } from './types/pull-request'

export enum NotificationStatus {
  New = 'new',
  Viewed = 'viewed',
  Hidden = 'hidden',
}

@Entity({ name: 'resolution' })
export class Resolution extends Base {
  @Column()
  status: NotificationStatus = NotificationStatus.New

  @Column({ type: ColumnType.Json })
  result: PullRequestResult | null = null
}
