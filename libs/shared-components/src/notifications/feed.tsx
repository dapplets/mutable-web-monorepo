import { NotificationDto, useNotifications } from '@mweb/engine'
import React, { useRef, useState } from 'react'
import { Item } from './item'
import { Space, notification as notify, Modal } from 'antd'
import { PrReviewer } from './pr-reviewer'

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
        <Modal
          title="Review Changes"
          open={true}
          getContainer={modalContainerRef.current ?? false}
          zIndex={10000}
          onClose={handleModalClose}
          width={1000}
        >
          <PrReviewer notification={reviewingNotification} />
        </Modal>
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
