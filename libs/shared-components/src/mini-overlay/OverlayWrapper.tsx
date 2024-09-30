import React, { Dispatch, FC, SetStateAction, useRef, useState } from 'react'
import styled from 'styled-components'
import { Drawer, Space, Button } from 'antd'
import { Typography } from 'antd'
import { NotificationProvider, useNotifications, useViewAllNotifications } from '@mweb/engine'
import { NotificationFeed } from '../notifications/feed'
const { Title, Text } = Typography

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

  &::-webkit-scrollbar {
    width: 0;
  }

  .notifySingle {
    width: 100%;
    user-select: none;
    column-gap: 8px;
    justify-content: space-between;
    background: #fff;
    border: 1px solid #e2e2e5;
    padding: 10px;
    border-radius: 10px;
    transition: all 0.2s ease;

    .notifySingle-item {
      column-gap: 8px;
    }

    .ant-typography {
      line-height: 1;
    }

    .ant-card-body {
      padding: 0;
    }

    .ant-collapse-header {
      padding: 0 16px;
    }
  }
  .notifyWrapper-item:first-of-type {
    .ant-space {
      width: 100%;
      justify-content: space-between;
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

  &::-webkit-scrollbar {
    width: 0;
  }

  .driwingWrapper {
    overflow: hidden;
    transition: all 0.2s ease;
  }

  .driwingContent {
    background: #f8f9ff;
    overflow: hidden;
    transition: all 0.2s ease;

    &::-webkit-scrollbar {
      width: 0;
    }

    .ant-drawer-close {
      display: none;
    }

    .ant-drawer-header {
      border-bottom: none;
      padding: 10px;
      padding-bottom: 0;

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

  &::-webkit-scrollbar {
    width: 0;
  }
`

export interface IOverlayWrapperProps {
  apps: boolean
  onClose: () => void
  open: boolean
  loggedInAccountId: string
  modalContainerRef: React.RefObject<HTMLElement>
}

const OverlayWrapper: FC<IOverlayWrapperProps> = ({
  apps,
  onClose,
  open,
  loggedInAccountId,
  modalContainerRef,
}) => {
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
                <NotificationFeed
                  loggedInAccountId={loggedInAccountId}
                  modalContainerRef={modalContainerRef}
                />
              </NotificationProvider>
            </Body>
          }
        ></Drawer>
      </OverlayContent>
    </OverlayWrapperBlock>
  )
}

export default OverlayWrapper
