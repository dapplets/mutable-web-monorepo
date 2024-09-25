import { useNotifications } from '@mweb/engine'
import React, { useRef } from 'react'
import { Item } from './item'
import { Space } from 'antd'

export const NotificationFeed = () => {
  const { notifications } = useNotifications()
  const overlayRef = useRef<HTMLDivElement>(null)

  return (
    <Space direction="vertical" ref={overlayRef}>
      {notifications
        .filter((notify) => notify.status === 'new')
        .map((notification) => (
          <Item key={notification.id} notification={notification} />
        ))}
      {notifications
        .filter((notify) => notify.status !== 'new' && notify.status !== 'hidden')
        .map((notification) => (
          <Item key={notification.id} notification={notification} />
        ))}
    </Space>
  )
}
