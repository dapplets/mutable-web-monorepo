import {
  CopyOutlined,
  HomeOutlined,
  LoginOutlined,
  LogoutOutlined,
  MenuOutlined,
  PlayCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Dropdown } from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import makeBlockie from 'ethereum-blockies-base64'
import React, { FC, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import styled from 'styled-components'
import { ProfileAddress } from '../../common/profile-address'
import { ProfileIcon } from '../../common/profile-icon'
import { ProfileInfo } from '../../common/profile-info'
import { ProfileNetwork } from '../../common/profile-network'
import { useEngine } from '../../contexts/engine-context'
import { Bell as BellIcon } from '../assets/icons'
import { ConnectedAccount } from '../../connected-accounts'
import { NearNetworks } from '@mweb/backend'
import ConnectMetaMaskButton from '../../common/connect-MetaMask-button'

const TopPadding = styled.div`
  display: flex;
  position: relative;
  width: 100%;
  height: 56px;
`

const BlurredBackdrop = styled.button<{ $shown: boolean }>`
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 2;
  background: rgba(255, 255, 255, 0.7);
  visibility: ${({ $shown }) => ($shown ? 'visible' : 'hidden')};
  opacity: ${({ $shown }) => ($shown ? 1 : 0)};
  transition: all 0.3s ease-in-out;
  border: none;
`

const HeaderWrapper = styled.div`
  --primary: oklch(53% 0.26 269.37); // rgb(56, 75, 255)
  --primary-hover: oklch(47.4% 0.2613 267.51); // rgb(36, 55, 235)
  --primary-pressed: oklch(42.2% 0.2585 265.62); // rgb(16, 35, 215)
  --font-default: system-ui, Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
    sans-serif;

  position: absolute;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  justify-content: space-between;
  align-items: center;
  width: calc(100% - 20px);
  border-radius: 10px;
  padding: 4px 10px;
  background: #fff;
  font-family: sans-serif;
  box-shadow:
    0px 4px 20px 0px #0b576f26,
    0px 4px 5px 0px #2d343c1a;
  min-height: 56px;
  z-index: 3;
`

const ActiveAccount = styled.div`
  display: flex;
  box-sizing: border-box;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 6px;
`

const DroppedAccounts = styled.div<{ $shown: boolean }>`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: ${({ $shown }) => ($shown ? '10px' : '0')};
  gap: 10px;
  height: ${({ $shown }) => ($shown ? 'auto' : '0')};
  opacity: ${({ $shown }) => ($shown ? 1 : 0)};
  transition:
    height 0.3s ease-in-out,
    opacity 0.3s ease-in-out;
  overflow: hidden;
`

const ProfileButton = styled.button`
  border: none;
  background: none;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 0;
  overflow: hidden;
  flex: 1;
  cursor: pointer;
`

const HeaderButtonsArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin: 0;
  padding: 4px;
`

const TextConnect = styled.div`
  color: #02193a;
  font-size: 14px;
  font-weight: 600;
`

const HeaderButton = styled.button<{ $isActive?: boolean }>`
  display: flex;
  box-sizing: border-box;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  width: 28px;
  aspect-ratio: 1;
  padding: 0;
  outline: none;
  border: none;
  border-radius: 50%;
  transition: all 0.15s ease;
  cursor: ${({ $isActive }) => ($isActive ? 'default' : 'pointer')};
  color: ${({ $isActive }) => ($isActive ? 'white' : 'rgb(122, 129, 139)')};
  background: ${({ $isActive }) => ($isActive ? 'rgb(56, 75, 255)' : 'rgb(248, 249, 255)')};
  flex-shrink: 0;

  svg {
    width: 17px;
    height: 18px;

    &#mweb-bell-icon {
      width: 28px;
      height: 30px;
    }
  }

  &:hover {
    color: ${({ $isActive }) => ($isActive ? 'white' : 'var(--primary)')};
    /* background-color: ${({ $isActive }) =>
      $isActive ? 'rgb(56, 75, 255)' : 'rgb(195, 197, 209)'}; */
  }

  &:active {
    color: ${({ $isActive }) => ($isActive ? 'white' : 'var(--primary-hover)')};
    /* background-color: ${({ $isActive }) =>
      $isActive ? 'rgb(56, 75, 255)' : 'rgb(173, 175, 187)'}; */
  }

  &:disabled {
    opacity: 0.7;
    cursor: default;
  }
`

const Header: FC = () => {
  const {
    onConnectWallet,
    onDisconnectWallet,
    loggedInAccountId,
    nearNetwork,
    addresses,
    onConnectEthWallet,
    walletChainName,
  } = useEngine()
  const navigate = useNavigate()
  const location = useLocation()

  const [waiting, setWaiting] = useState(false)
  const [isHeaderOpened, setIsHeaderOpened] = useState(false)
  console.log('isHeaderOpened', isHeaderOpened)

  const wrapperRef = useRef<HTMLDivElement>(null)

  const closeAccounts = () => setIsHeaderOpened(false)

  const handleSignIn = async () => {
    closeAccounts()
    setWaiting(true)
    try {
      await onConnectWallet()
    } finally {
      setWaiting(false)
    }
  }

  const handleSignOut = async () => {
    closeAccounts()
    setWaiting(true)
    try {
      await onDisconnectWallet()
    } finally {
      setWaiting(false)
    }
  }

  const menuItems: ItemType[] = [
    {
      label: 'Main',
      key: '0',
      onClick: () => {
        closeAccounts()
        navigate(`/main`)
      },
      icon: <HomeOutlined />,
    },
    {
      label: 'Profile',
      key: '1',
      onClick: () => {
        closeAccounts()
        navigate(`/profile`)
      },
      icon: <TeamOutlined />,
    },
    {
      label: 'Apps',
      key: '2',
      onClick: () => {
        closeAccounts()
        navigate(`/applications`)
      },
      icon: <PlayCircleOutlined />,
    },
    {
      type: 'divider',
    },
  ]

  if (loggedInAccountId) {
    menuItems.push({
      label: 'Copy address',
      key: '3',
      onClick: () => {
        closeAccounts()
        navigator.clipboard.writeText(loggedInAccountId)
      },
      disabled: waiting,
      icon: <CopyOutlined />,
    })
    menuItems.push({
      label: 'Log out',
      key: '4',
      onClick: () => {
        closeAccounts()
        handleSignOut()
      },
      disabled: waiting,
      icon: <LogoutOutlined />,
    })
  } else {
    menuItems.push({
      label: 'Connect NEAR wallet',
      key: '3',
      onClick: () => {
        closeAccounts()
        handleSignIn()
      },
      disabled: waiting,
      icon: <LoginOutlined />,
    })
  }

  return (
    <>
      <TopPadding />
      <BlurredBackdrop $shown={isHeaderOpened} onClick={closeAccounts} />
      <HeaderWrapper ref={wrapperRef}>
        <ActiveAccount>
          <ProfileButton
            title={loggedInAccountId ?? ''}
            onClick={() => setIsHeaderOpened((v) => !v)}
          >
            {loggedInAccountId ? (
              <>
                <ProfileIcon>
                  <img src={makeBlockie(loggedInAccountId)} alt="account blockie image" />
                </ProfileIcon>
                <ProfileInfo>
                  <ProfileAddress>{loggedInAccountId}</ProfileAddress>
                  <ProfileNetwork>
                    {nearNetwork === 'mainnet' ? 'NEAR-Mainnet' : 'NEAR-Testnet'}
                  </ProfileNetwork>
                </ProfileInfo>
              </>
            ) : (
              <TextConnect>No wallet connected</TextConnect>
            )}
          </ProfileButton>
          <HeaderButtonsArea>
            {loggedInAccountId ? (
              <HeaderButton
                $isActive={location.pathname === '/notifications'}
                disabled={waiting}
                onClick={() => {
                  closeAccounts()
                  navigate(`/notifications`)
                }}
                title="Notifications"
              >
                <BellIcon />
              </HeaderButton>
            ) : null}
            <Dropdown menu={{ items: menuItems }}>
              <HeaderButton>
                <MenuOutlined />
              </HeaderButton>
            </Dropdown>
          </HeaderButtonsArea>
        </ActiveAccount>
        <DroppedAccounts $shown={isHeaderOpened}>
          {addresses?.length ? (
            addresses.map((addr) => (
              <ConnectedAccount
                key={addr}
                loggedInNearAccountId={loggedInAccountId}
                nearNetwork={nearNetwork as NearNetworks}
                accountId={addr}
                chain={'ethereum/' + walletChainName}
                socialAccount={null}
                showModal={false}
                showCA={false}
                indicatorType="no indicator"
              />
            ))
          ) : (
            <ConnectMetaMaskButton onConnectEthWallet={onConnectEthWallet} />
          )}
        </DroppedAccounts>
      </HeaderWrapper>
    </>
  )
}

export default Header
