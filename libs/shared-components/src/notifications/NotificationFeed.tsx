import { useNotifications, useViewAllNotifications } from '@mweb/engine'
import React, { Dispatch, FC, SetStateAction, useEffect, useRef } from 'react'
import NotificationsResolver from './item'
import { Space, Typography, Button } from 'antd'
const { Text } = Typography

const NotificationFeed: FC<{
  loggedInAccountId: string
}> = ({ loggedInAccountId }) => {
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
      style={{ overflow: 'hidden', overflowY: 'auto', height: '100%', transition: 'all 0.2s ease' }}
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
      <Space direction="vertical" style={{ transition: 'all 0.2s ease' }}>
        {notifications
          .filter((notify) => notify.status === 'new')
          .map((notification) => (
            <NotificationsResolver key={notification.id} notification={notification} />
          ))}
      </Space>
      <Text type="secondary" style={{ textTransform: 'uppercase' }}>
        Old ({notifications.filter((not) => not.status === 'viewed').length})
      </Text>
      <Space direction="vertical" style={{ transition: 'all 0.2s ease' }}>
        {notifications
          .filter((notify) => notify.status === 'viewed')
          .map((notification) => (
            <NotificationsResolver key={notification.id} notification={notification} />
          ))}
      </Space>
    </Space>
  )
}

export default NotificationFeed
