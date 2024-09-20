import { useNotifications } from '@mweb/engine'
import React, { ReactNode, useEffect, useRef } from 'react'
import { Item } from './item'
import { Space, Button, notification as notify, ButtonProps } from 'antd'
import { actions } from './test-data-notification'

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
  <svg xmlns="http://www.w3.org/2000/svg" width="9" height="10" viewBox="0 0 9 10" fill="none">
    <path
      d="M8 1.5L1 8.5M1 1.5L8 8.5"
      stroke="#7A818B"
      strokeWidth="1.16667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const NotificationFeed = () => {
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

  useEffect(() => {
    {
      notifications.map(
        (notification) =>
          api.open({
            key: notification.id,
            duration: 0,
            message: <Item key={notification.id} notification={notification} />,
            btn: (
              <Space key={notification.id} direction="horizontal">
                {actions.map((action, i) => (
                  <Button
                    key={i}
                    type={action.type as ButtonProps['type']}
                    size="middle"
                    onClick={() => {
                      action.onClick?.()
                      api.destroy(i)
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
              // todo: need logic closed or readind
            },
            closeIcon:
              notification.status === 'new' ? (
                <IconNotificationMessage />
              ) : (
                <IconNotificationClose />
              ),
          }) as ReactNode
      )
    }
  }, [notifications, api])

  return (
    <Space direction="vertical" ref={overlayRef}>
      {contextHolder}
    </Space>
  )
}
