import React, { FC } from 'react'
import Notification from './Notification'
import { NotificationDto } from '@mweb/engine'

const NotificationsResolver: FC<{ notification: NotificationDto }> = ({ notification }) => {
  return notification.type === 'regular' ? (
    <Notification notification={notification} />
  ) : (
    <Notification notification={notification} />
  )
}

export default NotificationsResolver
