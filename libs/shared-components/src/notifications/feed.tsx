import { useNotifications } from '@mweb/engine'
import React, { FC } from 'react'
import { Item } from './item'

export const NotificationFeed = () => {
  const { notifications } = useNotifications()

  return (
    <>
      {notifications.map((notification) => (
        <Item key={notification.id} notification={notification} />
      ))}
    </>
  )
}
