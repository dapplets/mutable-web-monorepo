import React, { FC, useRef, useState } from 'react'
import styled from 'styled-components'
import { Drawer, Space, Button } from 'antd'
import { Typography } from 'antd'
import MultitablePanel from '../multitable-panel'
import NotificationFeed from '../notifications/notification-feed'
import { Close as CloseIcon, Logo as LogoIcon } from './assets/icons'
import Profile from './profile'
import { IWalletConnect } from './types'
const { Title, Text } = Typography
import { Connect as ConnectIcon } from './assets/icons'

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

  .notifyWrapper {
    &::-webkit-scrollbar {
      width: 0;
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
      background: #2b2a33;
      padding: 10px;

      h3 {
        margin-bottom: 0;
        color: #fff;
        align-items: center;
        display: inline-flex;
        gap: 10px;
      }

      .ant-space {
        width: 100%;
        justify-content: space-between;
      }

      button {
        padding: 5px;
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
  overflow-y: auto;

  &::-webkit-scrollbar {
    cursor: pointer;
    width: 3px;
  }

  &::-webkit-scrollbar-track {
    margin-bottom: 10px;
    margin-top: 65px;
    background: rgb(244 244 244);
    background: linear-gradient(
      90deg,
      rgb(244 244 244 / 0%) 10%,
      rgb(227 227 227 / 100%) 50%,
      rgb(244 244 244 / 0%) 90%
    );
  }

  &::-webkit-scrollbar-thumb {
    width: 2px;
    height: 2px;
    background: #7a818b;
    border-radius: 2px;
    box-shadow:
      0 2px 6px rgb(0 0 0 / 9%),
      0 2px 2px rgb(38 117 209 / 4%);
  }
`

const ButtonConnectWrapper = styled.button`
  display: flex;
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  width: 96px;
  height: 38px;
  gap: 4px;
  outline: none;
  border: none;
  background: #384bff;
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  padding: 0;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.6;
  }

  &:disabled {
    opacity: 0.6;
  }

  .loading {
    height: 0;
    width: 0;
    padding: 9px;
    border: 3px solid #8893ff;
    border-right-color: #0e1ebe;
    border-radius: 15px;
    animation: 1s infinite linear rotate;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }
`

export interface IOverlayWrapperProps extends IWalletConnect {
  apps: boolean
  onClose: () => void
  open: boolean
  loggedInAccountId: string
  modalContainerRef: React.RefObject<HTMLElement>
  trackingRefs?: Set<React.RefObject<HTMLDivElement>>
  openCloseNotificationPage: React.Dispatch<React.SetStateAction<boolean>>
  handleMutateButtonClick: () => void
}

const OverlayWrapper: FC<IOverlayWrapperProps> = ({
  apps,
  onClose,
  open,
  loggedInAccountId,
  connectWallet,
  disconnectWallet,
  nearNetwork,
  modalContainerRef,
  trackingRefs,
  handleMutateButtonClick,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [waiting, setWaiting] = useState(false)
  const [isProfileOpen, openCloseProfile] = useState(false)
  const isMutationIconButton = !!connectWallet && !!disconnectWallet && !!nearNetwork
  const openCloseWalletPopupRef = useRef<HTMLButtonElement>(null)

  const handleSignIn = async () => {
    setWaiting(true)
    try {
      await connectWallet()
    } finally {
      setWaiting(false)
    }
  }

  return (
    <OverlayWrapperBlock $isApps={apps}>
      <OverlayContent $isOpen={open} data-mweb-insertion-point="mweb-overlay">
        <Drawer
          title={
            <Space direction="vertical">
              <Space direction="horizontal">
                <Title style={{ userSelect: 'none' }} level={3}>
                  <LogoIcon /> Mutable Web
                </Title>

                <Button type="text" onClick={onClose}>
                  <CloseIcon />
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
              {loggedInAccountId ? (
                <>
                  <Profile
                    accountId={loggedInAccountId ?? null}
                    closeProfile={() => {
                      openCloseProfile(false)
                    }}
                    connectWallet={connectWallet!}
                    disconnectWallet={disconnectWallet}
                    nearNetwork={nearNetwork}
                    trackingRefs={trackingRefs!}
                    openCloseWalletPopupRef={openCloseWalletPopupRef}
                  />
                  <MultitablePanel
                    connectWallet={connectWallet}
                    loggedInAccountId={loggedInAccountId}
                    handleMutateButtonClick={handleMutateButtonClick}
                  />
                  <NotificationFeed
                    connectWallet={connectWallet}
                    loggedInAccountId={loggedInAccountId}
                    modalContainerRef={modalContainerRef}
                  />
                </>
              ) : (
                <>
                  <Profile
                    accountId={loggedInAccountId ?? null}
                    closeProfile={() => {
                      openCloseProfile(false)
                    }}
                    connectWallet={connectWallet!}
                    disconnectWallet={disconnectWallet}
                    nearNetwork={nearNetwork}
                    trackingRefs={trackingRefs!}
                    openCloseWalletPopupRef={openCloseWalletPopupRef}
                  />
                  <MultitablePanel
                    connectWallet={connectWallet}
                    loggedInAccountId={loggedInAccountId}
                    handleMutateButtonClick={handleMutateButtonClick}
                  />
                  <Space
                    direction="vertical"
                    style={{
                      width: '100%',
                      borderRadius: '20px',
                      background: '#fff',
                      padding: '8px 8px 20px',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Space direction="horizontal" style={{ width: '100%', display: 'flex' }}>
                      <Title style={{ userSelect: 'none', margin: '0 auto' }} level={3}>
                        Sign in
                      </Title>

                      <Button
                        type="text"
                        style={{
                          marginLeft: 'auto',
                          position: 'absolute',
                          right: '8px',
                          top: '8px',
                        }}
                        onClick={onClose}
                      >
                        <CloseIcon />
                      </Button>
                    </Space>

                    <Text
                      type="secondary"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '5px',
                        textAlign: 'center',
                        fontSize: '12px',
                      }}
                    >
                      To see personalized notifications, you must sign in by connecting your wallet.
                    </Text>
                  </Space>
                </>
              )}
            </Body>
          }
        ></Drawer>
      </OverlayContent>
    </OverlayWrapperBlock>
  )
}

export default OverlayWrapper
