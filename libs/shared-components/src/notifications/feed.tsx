import { NotificationDto, useNotifications, useViewAllNotifications } from '@mweb/engine'
import React, { FC, useRef, useState } from 'react'
import { Item } from './item'
import { Space, Typography, Button } from 'antd'
import { PrReviewerModal } from './pr-reviewer-modal'

const { Text } = Typography

export const NotificationFeed: FC<{
  loggedInAccountId: string
  modalContainerRef: React.RefObject<HTMLElement>
}> = ({ loggedInAccountId, modalContainerRef }) => {
  const { notifications } = useNotifications()
  const overlayRef = useRef<HTMLDivElement>(null)
  const {
    viewAllNotifcations,
    isLoading: isLoadingView,
    error: errorView,
  } = useViewAllNotifications(loggedInAccountId)

  const [reviewingNotification, setReviewingNotification] = useState<NotificationDto | null>(null)

  const handleReviewClick = (notification: NotificationDto) => {
    setReviewingNotification(notification)
  }

  const handleModalClose = () => {
    setReviewingNotification(null)
  }

  return (
    <>
      {reviewingNotification ? (
        <PrReviewerModal
          notification={reviewingNotification}
          containerRef={modalContainerRef}
          onClose={handleModalClose}
        />
      ) : null}
      <Space
        prefixCls="notifyWrapper"
        direction="vertical"
        ref={overlayRef}
        style={{
          overflow: 'hidden',
          overflowY: 'auto',
          height: '100%',
          transition: 'all 0.2s ease',
        }}
      >
        <Space direction="horizontal">
          <Text type="secondary" style={{ textTransform: 'uppercase' }}>
            New ({notifications.filter((not) => not.status === 'new').length})
          </Text>
          <Button style={{ float: 'right' }} onClick={viewAllNotifcations} type="link">
            Mark all as read
          </Button>
        </Space>

        <Space direction="vertical" style={{ transition: 'all 0.2s ease' }}>
          {notifications
            .filter((notify) => notify.status === 'new')
            .map((notification) => (
              <Item
                key={notification.id}
                notification={notification}
                onReview={handleReviewClick}
              />
            ))}
        </Space>
        <Text type="secondary" style={{ textTransform: 'uppercase' }}>
          Old ({notifications.filter((not) => not.status === 'viewed').length})
        </Text>
        <Space direction="vertical" style={{ transition: 'all 0.2s ease' }}>
          {notifications
            .filter((notify) => notify.status === 'viewed')
            .map((notification) => (
              <Item
                key={notification.id}
                notification={notification}
                onReview={handleReviewClick}
              />
            ))}
        </Space>
      </Space>
    </>
  )
}
