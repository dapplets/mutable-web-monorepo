import { useNotifications } from '@mweb/engine'
import React, { useRef } from 'react'
import { Item } from './item'
import { Space, notification as notify } from 'antd'

export const NotificationFeed = () => {
  const { notifications } = useNotifications()
  const overlayRef = useRef<HTMLDivElement>(null)
  const [api, contextHolder] = notify.useNotification({
    prefixCls: 'useNotification',
    getContainer: () => {
      if (!overlayRef.current) throw new Error('Viewport is not initialized')
      return overlayRef.current
    },
    stack: false,
  })

  return (
    <Space direction="vertical" ref={overlayRef}>
      {notifications
        .filter((notify) => notify.status === 'new')
        .map((notification) => (
          <Item key={notification.id} notification={notification} api={api} />
        ))}
      {notifications
        .filter((notify) => notify.status !== 'new')
        .map((notification) => (
          <Item key={notification.id} notification={notification} api={api} />
        ))}
      {contextHolder}
    </Space>
  )
}
