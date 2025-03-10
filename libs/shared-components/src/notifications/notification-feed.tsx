import { useNotifications, useViewAllNotifications } from '@mweb/react-engine'
import { Button, Flex, Space, Spin, Typography } from 'antd'
import React, { FC, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { sortNotificationsByTimestamp } from './utils'
import { NotificationsResolver } from './notification-resolver'

const { Text } = Typography

const FeedContainer = styled(Space)`
  height: 100%;
  transition: all 0.2s ease;
  width: 100%;
  gap: 10px;
`

const SmoothSpace = styled(Space)`
  transition: all 0.2s ease;
`

const SpinContainer = styled(Flex)`
  transition: all 0.2s ease;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`

const Loader = () => (
  <SpinContainer prefixCls="spin">
    <Spin size="large" />
  </SpinContainer>
)

const NotificationFeed: FC<{
  loggedInAccountId: string
  onConnectWallet: (() => Promise<void>) | undefined
}> = ({ loggedInAccountId, onConnectWallet }) => {
  const [isWaiting, setWaiting] = useState(false)
  const { notifications, isLoading } = useNotifications(loggedInAccountId)
  const overlayRef = useRef<HTMLDivElement>(null)
  const { viewAllNotifications, isLoading: isViewAllLoading } =
    useViewAllNotifications(loggedInAccountId)

  const viewedNotifications = useMemo(
    () => notifications.filter((notification) => notification.status === 'viewed'),
    [notifications]
  )

  const newNotifications = useMemo(
    () => notifications.filter((notification) => notification.status === 'new'),
    [notifications, viewedNotifications]
  )

  const handleSignIn = async () => {
    setWaiting(true)
    try {
      onConnectWallet && (await onConnectWallet())
    } finally {
      setWaiting(false)
    }
  }

  return (
    <FeedContainer prefixCls="notifyWrapper" direction="vertical" ref={overlayRef}>
      {isLoading || isWaiting || isViewAllLoading ? (
        <Loader />
      ) : !loggedInAccountId ? (
        <Text type="secondary">
          {!!onConnectWallet ? (
            <Button style={{ padding: ' 4px 4px' }} type="link" onClick={handleSignIn}>
              Login
            </Button>
          ) : (
            'Login '
          )}
          to see more notifications
        </Text>
      ) : (
        <>
          <Flex vertical>
            <Space direction="horizontal">
              <Text type="secondary" style={{ textTransform: 'uppercase' }}>
                New ({newNotifications.length})
              </Text>
              {newNotifications.length ? (
                <Button
                  style={{ float: 'right' }}
                  onClick={() => viewAllNotifications()}
                  type="link"
                >
                  Mark all as read
                </Button>
              ) : null}
            </Space>
            <SmoothSpace direction="vertical">
              {sortNotificationsByTimestamp(newNotifications).map((notification, i) => (
                <NotificationsResolver
                  key={notification.id + i}
                  notification={notification}
                  loggedInAccountId={loggedInAccountId}
                />
              ))}
            </SmoothSpace>
          </Flex>
          <Flex vertical>
            <Space direction="horizontal" style={{ height: 32 }}>
              <Text type="secondary" style={{ textTransform: 'uppercase' }}>
                Old ({viewedNotifications.length})
              </Text>
            </Space>
            <SmoothSpace direction="vertical">
              {sortNotificationsByTimestamp(viewedNotifications).map((notification, i) => (
                <NotificationsResolver
                  key={i + notification.id}
                  notification={notification}
                  loggedInAccountId={loggedInAccountId}
                />
              ))}
            </SmoothSpace>
          </Flex>
        </>
      )}
    </FeedContainer>
  )
}

export default NotificationFeed
