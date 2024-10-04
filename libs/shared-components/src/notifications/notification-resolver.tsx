import React, { FC } from 'react'
import RegularNotification, { RegularNotificationDto } from './regular-notification'
import PullRequestNotification, { PullRequestNotificationDto } from './pull-request-notification'
import { NotificationDto, NotificationType } from '@mweb/backend'

const NotificationsResolver: FC<{
  notification: NotificationDto
  modalContainerRef: React.RefObject<HTMLElement>
}> = ({ notification, modalContainerRef }) => {
  switch (notification.type) {
    case NotificationType.Regular:
      return <RegularNotification notification={notification as RegularNotificationDto} />
    case NotificationType.PullRequest:
      return (
        <PullRequestNotification
          notification={notification as PullRequestNotificationDto}
          modalContainerRef={modalContainerRef}
        />
      )
    default:
      return null
  }
}

export default NotificationsResolver
