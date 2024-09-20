import React, { FC } from 'react'
import { CreateSingleNotification } from './utils/createSingleNotification'
import { NotificationType, NotificationDto } from '@mweb/engine'

export const Item: FC<{ notification: NotificationDto }> = ({ notification }) => {
  switch (notification.type) {
    case NotificationType.Regular:
      return <CreateSingleNotification notification={notification} />
    case NotificationType.PullRequest:
      return <CreateSingleNotification notification={notification} />
    default:
      return null
  }
}
