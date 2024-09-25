import { useNotifications, useViewAllNotifications } from '@mweb/engine'
import React, { FC, useRef } from 'react'
import { Item } from './item'
import { Space, Typography, Button } from 'antd'
const { Text } = Typography

export const NotificationFeed: FC<{ loggedInAccountId: string }> = ({ loggedInAccountId }) => {
  const { notifications } = useNotifications()
  const overlayRef = useRef<HTMLDivElement>(null)
  const {
    viewAllNotifcations,
    isLoading: isLoadingView,
    error: errorView,
  } = useViewAllNotifications(loggedInAccountId)

  return (
    <Space
      prefixCls="notifyWrapper"
      direction="vertical"
      ref={overlayRef}
      style={{ overflow: 'hidden', height: '100%' }}
    >
      <Space direction="horizontal">
        <Text type="secondary" style={{ textTransform: 'uppercase' }}>
          New ({notifications.filter((not) => not.status === 'new').length})
        </Text>
        <Button
          style={{ float: 'right' }}
          onClick={() => {
            viewAllNotifcations()
          }}
          type="link"
        >
          Mark all as read
        </Button>
      </Space>
      <Space direction="vertical" style={{ overflow: 'scroll', height: '100%' }}>
        {notifications
          .filter((notify) => notify.status === 'new')
          .map((notification) => (
            <Item key={notification.id} notification={notification} />
          ))}
      </Space>
      <Text type="secondary" style={{ textTransform: 'uppercase' }}>
        Old ({notifications.filter((not) => not.status === 'viewed').length})
      </Text>
      <Space direction="vertical" style={{ overflow: 'scroll', height: '100%' }}>
        {notifications
          .filter((notify) => notify.status === 'viewed')
          .map((notification) => (
            <Item key={notification.id} notification={notification} />
          ))}
      </Space>
    </Space>
  )
}
