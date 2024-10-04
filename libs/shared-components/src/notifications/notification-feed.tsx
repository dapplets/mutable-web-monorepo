import { useNotifications, useViewAllNotifications } from '@mweb/engine'
import React, { FC, useMemo, useRef, useState } from 'react'
import NotificationsResolver from './notification-resolver'
import { Space, Typography, Button, Spin, Flex } from 'antd'
import styled from 'styled-components'

const { Text } = Typography

const FeedContainer = styled(Space)`
  overflow: hidden;
  overflow-y: auto;
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
  width: 100%;
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
  connectWallet: (() => Promise<void>) | undefined
  modalContainerRef: React.RefObject<HTMLElement>
}> = ({ loggedInAccountId, connectWallet, modalContainerRef }) => {
  const [isWaiting, setWaiting] = useState(false)
  const { notifications, isLoading } = useNotifications()
  const overlayRef = useRef<HTMLDivElement>(null)
  const { viewAllNotifcations, isLoading: isViewAllLoading } =
    useViewAllNotifications(loggedInAccountId)

  const newNotifications = useMemo(
    () => notifications.filter((notification) => notification.status === 'new'),
    [notifications]
  )

  const viewedNotifications = useMemo(
    () => notifications.filter((notification) => notification.status === 'viewed'),
    [notifications]
  )

  const handleSignIn = async () => {
    setWaiting(true)
    try {
      connectWallet && (await connectWallet())
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
          {!!connectWallet ? (
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
                  onClick={() => viewAllNotifcations()}
                  type="link"
                >
                  Mark all as read
                </Button>
              ) : null}
            </Space>
            <SmoothSpace direction="vertical">
              {newNotifications.map((notification) => (
                <NotificationsResolver
                  key={notification.id}
                  notification={notification}
                  modalContainerRef={modalContainerRef}
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
              {viewedNotifications.map((notification) => (
                <NotificationsResolver
                  key={notification.id}
                  notification={notification}
                  modalContainerRef={modalContainerRef}
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
