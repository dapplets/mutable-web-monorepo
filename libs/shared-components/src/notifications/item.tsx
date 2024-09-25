import React, { FC } from 'react'
import { CreateSingleNotification } from './utils/createSingleNotification'
import { NotificationDto } from '@mweb/engine'

export const Item: FC<{ notification: NotificationDto }> = ({ notification }) => {
  return notification.type === 'regular' ? (
    <CreateSingleNotification notification={notification} />
  ) : (
    <CreateSingleNotification notification={notification} />
  )
}
