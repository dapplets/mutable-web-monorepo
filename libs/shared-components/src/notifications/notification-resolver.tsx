import React, { FC } from 'react'
import RegularNotification, { RegularNotificationDto } from './regular-notification'
import PullRequestNotification, { PullRequestNotificationDto } from './pull-request-notification'
import { NotificationDto, NotificationType } from '@mweb/engine'

const NotificationsResolver: FC<{ notification: NotificationDto }> = ({ notification }) => {
  switch (notification.type) {
    case NotificationType.Regular:
      return <RegularNotification notification={notification as RegularNotificationDto} />
    case NotificationType.PullRequest:
      return <PullRequestNotification notification={notification as PullRequestNotificationDto} />
    default:
      return null
  }
}

export default NotificationsResolver
