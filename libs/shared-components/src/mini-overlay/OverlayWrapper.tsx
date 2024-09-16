import React, { FC, useCallback, useRef, useState } from 'react'
import styled from 'styled-components'
import { Drawer, notification, Space, Button } from 'antd'
import { createSingleNotification } from '../notifications/utils/createSingleNotification'
import { GenericNotification } from '../notifications/types'
import { notifications } from '../notifications/test-data-notification'
import { Typography } from 'antd'

const { Title, Text } = Typography

const IconNotificationMessage = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path
      d="M1.5 3.5C1.5 3.23478 1.60536 2.98043 1.79289 2.79289C1.98043 2.60536 2.23478 2.5 2.5 2.5H9.5C9.76522 2.5 10.0196 2.60536 10.2071 2.79289C10.3946 2.98043 10.5 3.23478 10.5 3.5V8.5C10.5 8.76522 10.3946 9.01957 10.2071 9.20711C10.0196 9.39464 9.76522 9.5 9.5 9.5H2.5C2.23478 9.5 1.98043 9.39464 1.79289 9.20711C1.60536 9.01957 1.5 8.76522 1.5 8.5V3.5Z"
      stroke="#7A818B"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M1.5 3.5L6 6.5L10.5 3.5"
      stroke="#7A818B"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
)
const IconNotificationClose = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="9" height="10" viewBox="0 0 9 10" fill="none">
    <path
      d="M8 1.5L1 8.5M1 1.5L8 8.5"
      stroke="#7A818B"
      stroke-width="1.16667"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
)

const OverlayWrapperBlock = styled.div<{ $isApps: boolean }>`
  position: fixed;
  z-index: 6000;
  display: flex;
  width: 0;
  bottom: 0;
  right: 0;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: transparent;
  font-family: sans-serif;
  box-sizing: border-box;

  .useNotification {
    position: absolute;
    height: 100%;
    width: 100%;
    margin: 0;
    bottom: 0 !important;
    top: 0 !important;
    left: 0;
  }

  .notifySingle {
    width: 100%;

    .useNotification-notice-icon {
      display: none;
    }

    .useNotification-notice-wrapper {
      box-shadow: none;
    }
    .useNotification-notice-message {
      margin-inline-start: 0 !important;
    }

    .useNotification-notice-description {
      margin-inline-start: 0 !important;
    }

    .useNotification-notice-btn {
      float: none !important;
    }

    .useNotification-notice-close {
      inset-inline-end: 10px;
      top: 10px;
    }
  }
`
const OverlayContent = styled.div<{ $isOpen: boolean }>`
  position: relative;
  display: ${(props) => (props.$isOpen ? 'block' : 'none')};
  height: 100vh;
  width: 340px;
  right: 0;
  bottom: 0;
  overflow: hidden;
  background: transparent;
  transform: translateX(-50%);
  box-sizing: border-box;
  padding: 50px;
  box-shadow:
    0px 3px 6px 0px rgba(71, 65, 252, 0.05),
    0px 11px 11px 0px rgba(71, 65, 252, 0.04),
    0px 25px 15px 0px rgba(71, 65, 252, 0.03),
    0px 44px 17px 0px rgba(71, 65, 252, 0.01),
    0px 68px 19px 0px rgba(71, 65, 252, 0);

  .driwingContent {
    background: #f8f9ff;

    .ant-drawer-close {
      display: none;
    }

    .ant-drawer-header {
      border-bottom: none;
      padding: 10px;

      h3 {
        margin-bottom: 0;
      }

      .ant-space {
        width: 100%;
        justify-content: space-between;
      }
    }

    .ant-drawer-body {
      padding: 10px;
    }
  }
`

const Body = styled.div`
  height: 100%;
  position: relative;
  overflow: hidden;
  overflow-y: scroll;
`

export interface IOverlayWrapperProps {
  apps: boolean
  onClose: () => void
  open: boolean
  // children: any
}

const getRandomNotification = (): GenericNotification => {
  const randomIndex = Math.floor(Math.random() * notifications.length)
  return notifications[randomIndex]
}

const OverlayWrapper: FC<IOverlayWrapperProps> = ({ apps, onClose, open }) => {
  const [waiting, setWaiting] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [api, contextHolder] = notification.useNotification({
    prefixCls: 'useNotification',
    getContainer: () => {
      if (!overlayRef.current) throw new Error('Viewport is not initialized')
      return overlayRef.current
    },
    stack: false,
  })

  const openNotify = useCallback(
    (notificationProps: GenericNotification, id: string) => {
      api[notificationProps.apiType]({
        key: id + notificationProps.id,
        duration: 0,
        message: createSingleNotification(notificationProps, id),
        btn:
          notificationProps.actions && notificationProps.actions.length ? (
            <Space key={notificationProps.id} direction="horizontal">
              {notificationProps.actions.map((action, i) => (
                <Button
                  key={i}
                  type={action.type ?? 'default'}
                  size="middle"
                  onClick={() => {
                    action.onClick?.()
                    api.destroy(id)
                  }}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </Space>
          ) : null,

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
        closeIcon: notificationProps.isRead ? (
          <IconNotificationMessage />
        ) : (
          <IconNotificationClose />
        ),
      })
    },
    [notification]
  )

  const handleTestClick = () => {
    const randomNotification = getRandomNotification()

    openNotify(randomNotification, `${Date.now()}`)
  }

  return (
    <OverlayWrapperBlock $isApps={apps}>
      <OverlayContent $isOpen={open} data-mweb-insertion-point="mweb-overlay">
        <Drawer
          title={
            <Space direction="vertical">
              <Space direction="horizontal">
                <Title level={3}>Notifications</Title>
                {/* todo: only for test */}
                <Button block type="primary" onClick={handleTestClick}>
                  create
                </Button>

                <Button type="text" onClick={onClose}>
                  <IconNotificationClose />
                </Button>
              </Space>
              <Button
                style={{ float: 'right' }}
                onClick={() => {
                  // todo need function mark all read
                }}
                type="link"
              >
                Mark all as read
              </Button>
            </Space>
          }
          placement="right"
          onClose={onClose}
          open={open}
          getContainer={false}
          mask={false}
          classNames={{
            wrapper: 'driwingWrapper',
            content: 'driwingContent',
          }}
          width={340}
          data-testid="overlay-notify"
          children={<Body ref={overlayRef}>{contextHolder}</Body>}
        >
          {/* todo: I don’t know how to separate the old ones from the new ones  */}
        </Drawer>
        {/* {children} */}
      </OverlayContent>
    </OverlayWrapperBlock>
  )
}

export default OverlayWrapper
