import React, { FC } from 'react'
import { GenericNotification } from './types'
import { CreateSingleNotification } from './utils/createSingleNotification'
import {
  NotificationType,
  NotificationProvider,
  useNotifications,
  NotificationDto,
} from '@mweb/engine'

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
