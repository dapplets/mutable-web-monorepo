import React, { FC, useEffect } from 'react'
import { CreateSingleNotification } from './utils/createSingleNotification'
import {
  NotificationDto,
  useViewNotification,
  useHideNotification,
  useAcceptPullRequest,
  useRejectPullRequest,
} from '@mweb/engine'
import { NotificationInstance } from 'antd/es/notification/interface'
import { actions } from './test-data-notification'
import { Space, Button, ButtonProps } from 'antd'

const IconNotificationMessage = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path
      d="M1.5 3.5C1.5 3.23478 1.60536 2.98043 1.79289 2.79289C1.98043 2.60536 2.23478 2.5 2.5 2.5H9.5C9.76522 2.5 10.0196 2.60536 10.2071 2.79289C10.3946 2.98043 10.5 3.23478 10.5 3.5V8.5C10.5 8.76522 10.3946 9.01957 10.2071 9.20711C10.0196 9.39464 9.76522 9.5 9.5 9.5H2.5C2.23478 9.5 1.98043 9.39464 1.79289 9.20711C1.60536 9.01957 1.5 8.76522 1.5 8.5V3.5Z"
      stroke="#7A818B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1.5 3.5L6 6.5L10.5 3.5"
      stroke="#7A818B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const IconNotificationClose = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path
      d="M6.75 9.5H2.5C2.23478 9.5 1.98043 9.39464 1.79289 9.20711C1.60536 9.01957 1.5 8.76522 1.5 8.5V3.5C1.5 3.23478 1.60536 2.98043 1.79289 2.79289C1.98043 2.60536 2.23478 2.5 2.5 2.5H9.5C9.76522 2.5 10.0196 2.60536 10.2071 2.79289C10.3946 2.98043 10.5 3.23478 10.5 3.5V6.5"
      stroke="#7A818B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1.5 3.5L6 6.5L10.5 3.5M11 11L8.5 8.5M8.5 11L11 8.5"
      stroke="#7A818B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const Item: FC<{ notification: NotificationDto; api: NotificationInstance }> = ({
  notification,
  api,
}) => {
  const { viewNotification } = useViewNotification(notification.id)
  const { hideNotification } = useHideNotification(notification.id)
  const { acceptPullRequest } = useAcceptPullRequest(notification.id)
  const { rejectPullRequest } = useRejectPullRequest(notification.id)

  useEffect(() => {
    api.open({
      key: notification.id,
      duration: 0,
      message:
        notification.type === 'regular' ? (
          <CreateSingleNotification notification={notification} />
        ) : (
          <CreateSingleNotification notification={notification} />
        ),

      btn: (
        <Space key={notification.id} direction="horizontal">
          {actions.map((action, i) => (
            <Button
              key={i}
              type={action.type as ButtonProps['type']}
              size="middle"
              onClick={() => {
                if (action.label === 'Accept') acceptPullRequest()
                if (action.label === 'Decline') rejectPullRequest()
              }}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </Space>
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
      onClose: () => {
        if (notification.status === 'new') {
          viewNotification()
        } else {
          hideNotification()
        }
      },
      closeIcon:
        notification.status === 'new' ? <IconNotificationMessage /> : <IconNotificationClose />,
    })
  }, [api, notification, viewNotification, hideNotification, acceptPullRequest, rejectPullRequest])

  return null
}
