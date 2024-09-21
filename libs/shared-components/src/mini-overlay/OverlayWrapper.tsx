import React, { FC, useRef, useState } from 'react'
import styled from 'styled-components'
import { Drawer, Space, Button } from 'antd'
import { Typography } from 'antd'
import { NotificationProvider } from '@mweb/engine'
import { NotificationFeed } from '../notifications/feed'
const { Title } = Typography

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

    .useNotification-notice-wrapper {
      box-shadow: none;
    }
  }

  .notifySingle {
    width: 100%;

    .useNotification-notice-icon {
      display: none;
    }

    .useNotification-notice-message {
      margin-inline-start: 0 !important;

      .ant-collapse-header {
        .ant-space {
          justify-content: space-between;
        }
      }
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

    .ant-space {
      width: 100%;
      user-select: none;
    }
  }
`
const OverlayContent = styled.div<{ $isOpen: boolean }>`
  position: relative;
  display: ${(props) => (props.$isOpen ? 'block' : 'none')};
  height: 100vh;
  width: 360px;
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
    overflow: hidden;

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
  loggedInAccountId: string
}

const OverlayWrapper: FC<IOverlayWrapperProps> = ({ apps, onClose, open, loggedInAccountId }) => {
  const [waiting, setWaiting] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  return (
    <OverlayWrapperBlock $isApps={apps}>
      <OverlayContent $isOpen={open} data-mweb-insertion-point="mweb-overlay">
        <Drawer
          title={
            <Space direction="vertical">
              <Space direction="horizontal">
                <Title style={{ userSelect: 'none' }} level={3}>
                  Notifications
                </Title>

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
          width={360}
          data-testid="overlay-notify"
          children={
            <Body ref={overlayRef}>
              <NotificationProvider recipientId={loggedInAccountId}>
                <NotificationFeed />
              </NotificationProvider>
            </Body>
          }
        ></Drawer>
      </OverlayContent>
    </OverlayWrapperBlock>
  )
}

export default OverlayWrapper
