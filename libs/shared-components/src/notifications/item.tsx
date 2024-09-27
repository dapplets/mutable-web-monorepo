import React, { FC } from 'react'
import { CreateSingleNotification } from './utils/createSingleNotification'
import { NotificationDto, NotificationType } from '@mweb/engine'

export const Item: FC<{
  notification: NotificationDto
  onReview: (notification: NotificationDto) => void
}> = ({ notification, onReview }) => {
  switch (notification.type) {
    case NotificationType.Regular:
      return <CreateSingleNotification notification={notification} onReview={onReview} />
    case NotificationType.PullRequest:
      return <CreateSingleNotification notification={notification} onReview={onReview} />
    default:
      return null
  }
}
