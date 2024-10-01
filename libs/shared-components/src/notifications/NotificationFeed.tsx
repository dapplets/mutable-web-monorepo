import { useNotifications, useViewAllNotifications } from '@mweb/engine'
import React, { FC, useRef, useState } from 'react'
import NotificationsResolver from './NotificationResolver'
import { Space, Typography, Button, Spin, Flex } from 'antd'
const { Text } = Typography

const NotificationFeed: FC<{
  loggedInAccountId: string
  connectWallet: (() => Promise<void>) | undefined
}> = ({ loggedInAccountId, connectWallet }) => {
  const [waiting, setWaiting] = useState(false)
  const { notifications, isLoading } = useNotifications()
  const overlayRef = useRef<HTMLDivElement>(null)
  const {
    viewAllNotifcations,
    isLoading: isLoadingView,
    error: errorView,
  } = useViewAllNotifications(loggedInAccountId)

  const handleSignIn = async () => {
    setWaiting(true)
    try {
      connectWallet && (await connectWallet())
    } finally {
      setWaiting(false)
    }
  }

  return (
    <Space
      prefixCls="notifyWrapper"
      direction="vertical"
      ref={overlayRef}
      style={{
        overflow: 'hidden',
        overflowY: 'auto',
        height: '100%',
        transition: 'all 0.2s ease',
        width: '100%',
      }}
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
      </Space>{' '}
      {!loggedInAccountId ? (
        <>
          {waiting ? (
            <Flex
              prefixCls="spin"
              style={{
                transition: 'all 0.2s ease',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Spin size="large" />
            </Flex>
          ) : (
            <Text type="secondary">
              <Button style={{ padding: ' 4px 4px' }} type="link" onClick={handleSignIn}>
                Login
              </Button>
              to see more notifications
            </Text>
          )}
        </>
      ) : isLoading ? (
        <Flex
          prefixCls="spin"
          style={{
            transition: 'all 0.2s ease',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <Spin size="large" />
        </Flex>
      ) : (
        <>
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
        </>
      )}
    </Space>
  )
}

export default NotificationFeed
