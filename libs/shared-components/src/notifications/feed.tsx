import { NotificationDto, useNotifications } from '@mweb/engine'
import React, { useRef, useState } from 'react'
import { Item } from './item'
import { Space, notification, notification as notify } from 'antd'
import { PrReviewerModal } from './pr-reviewer-modal'

export const NotificationFeed = ({
  modalContainerRef,
}: {
  modalContainerRef: React.RefObject<HTMLElement>
}) => {
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

  const [reviewingNotification, setReviewingNotification] = useState<NotificationDto | null>(null)

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
      <Space direction="vertical" ref={overlayRef}>
        {notifications
          .filter((notify) => notify.status === 'new')
          .map((notification) => (
            <Item
              key={notification.id}
              notification={notification}
              api={api}
              onReview={setReviewingNotification}
            />
          ))}
        {notifications
          .filter((notify) => notify.status !== 'new')
          .map((notification) => (
            <Item
              key={notification.id}
              notification={notification}
              api={api}
              onReview={setReviewingNotification}
            />
          ))}
        {contextHolder}
      </Space>
    </>
  )
}
