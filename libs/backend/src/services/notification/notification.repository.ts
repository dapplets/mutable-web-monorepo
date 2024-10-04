import { Notification } from './notification.entity'
import { BaseRepository } from '../base/base.repository'
import { SocialDbService } from '../social-db/social-db.service'

export class NotificationRepository extends BaseRepository<Notification> {
  constructor(socialDb: SocialDbService) {
    super(Notification, socialDb)
  }
}
