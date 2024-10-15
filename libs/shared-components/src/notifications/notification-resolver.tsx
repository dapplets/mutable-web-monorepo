import React, { FC } from 'react'
import RegularNotification, { RegularNotificationDto } from './regular-notification'
import PullRequestNotification, { PullRequestNotificationDto } from './pull-request-notification'
import { NotificationDto, NotificationType } from '@mweb/backend'

const NotificationsResolver: FC<{
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
        <PullRequestNotification
          loggedInAccountId={loggedInAccountId}
          notification={notification as PullRequestNotificationDto}
          modalContainerRef={modalContainerRef}
        />
      )
    case NotificationType.PullRequestRejected:
      return (
        <PullRequestNotification
          loggedInAccountId={loggedInAccountId}
          notification={notification as PullRequestNotificationDto}
          modalContainerRef={modalContainerRef}
        />
      )
    default:
      return null
  }
}

export default NotificationsResolver
