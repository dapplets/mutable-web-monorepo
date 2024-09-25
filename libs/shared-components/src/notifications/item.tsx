import React, { FC, useEffect } from 'react'
import { CreateSingleNotification } from './utils/createSingleNotification'
import { NotificationDto } from '@mweb/engine'
import { NotificationInstance } from 'antd/es/notification/interface'

export const Item: FC<{
  notification: NotificationDto
  api: NotificationInstance
  onReview: (notification: NotificationDto) => void
}> = ({ notification, api, onReview }) => {
  useEffect(() => {
    api.open({
      key: notification.id,
      duration: 0,
      message:
        notification.type === 'regular' ? (
          <CreateSingleNotification notification={notification} onReview={onReview} />
        ) : (
          <CreateSingleNotification notification={notification} onReview={onReview} />
        ),

      className: 'notifySingle',
      icon: <></>,
      props: { 'data-testid': 'overlay-notify' },
      style: {
        padding: 5,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#e2e2e5',
        borderRadius: 5,
        width: '100%',
      },
      closable: false,
    })
  }, [api, notification])

  return null
}
