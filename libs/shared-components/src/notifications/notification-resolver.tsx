import React, { FC } from 'react'
import { NotificationDto, NotificationType } from '@mweb/backend'
import RegularNotification, { RegularNotificationDto } from './regular-notification'
import PullRequestNotification, { PullRequestNotificationDto } from './pull-request-notification'
import PullRequestAcceptedNotification, {
  PullRequestAcceptedNotificationDto,
} from './pull-request-accepted'
import PullRequestRejectedNotification, {
  PullRequestRejectedNotificationDto,
} from './pull-request-rejected'

export const NotificationsResolver: FC<{
  notification: NotificationDto
  modalContainerRef: React.RefObject<HTMLElement>
  loggedInAccountId: string
}> = ({ notification, modalContainerRef, loggedInAccountId }) => {
  switch (notification.type) {
    case NotificationType.Regular:
      return (
        <RegularNotification
          loggedInAccountId={loggedInAccountId}
          notification={notification as RegularNotificationDto}
        />
      )
    case NotificationType.PullRequest:
      return (
        <PullRequestNotification
          loggedInAccountId={loggedInAccountId}
          notification={notification as PullRequestNotificationDto}
          modalContainerRef={modalContainerRef}
        />
      )
    case NotificationType.PullRequestAccepted:
      return (
        <PullRequestAcceptedNotification
          loggedInAccountId={loggedInAccountId}
          notification={notification as PullRequestAcceptedNotificationDto}
        />
      )
    case NotificationType.PullRequestRejected:
      return (
        <PullRequestRejectedNotification
          loggedInAccountId={loggedInAccountId}
          notification={notification as PullRequestRejectedNotificationDto}
        />
      )
    default:
      return null
  }
}
