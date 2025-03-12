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

const HeaderWrapper = styled.div`
  --primary: oklch(53% 0.26 269.37); // rgb(56, 75, 255)
  --primary-hover: oklch(47.4% 0.2613 267.51); // rgb(36, 55, 235)
  --primary-pressed: oklch(42.2% 0.2585 265.62); // rgb(16, 35, 215)

  display: flex;
  box-sizing: border-box;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border-radius: 10px;
  padding: 4px 10px;
  background: #fff;
  font-family: sans-serif;
  box-shadow:
    0px 4px 20px 0px #0b576f26,
    0px 4px 5px 0px #2d343c1a;
  gap: 6px;
  min-height: 56px;
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
  width: 24px;
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

const Header: FC<{ onOpenHeader: () => void }> = ({ onOpenHeader }) => {
  const { onConnectWallet, onDisconnectWallet, loggedInAccountId, nearNetwork } = useEngine()
  const navigate = useNavigate()
  const location = useLocation()

  const [waiting, setWaiting] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)

  const handleSignIn = async () => {
    setWaiting(true)
    try {
      await onConnectWallet()
    } finally {
      setWaiting(false)
    }
  }

  const handleSignOut = async () => {
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
      onClick: () => navigate(`/main`),
      icon: <HomeOutlined />,
    },
    {
      label: 'Profile',
      key: '1',
      onClick: () => navigate(`/profile`),
      icon: <TeamOutlined />,
    },
    {
      label: 'Apps',
      key: '2',
      onClick: () => navigate(`/applications`),
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
      onClick: () => navigator.clipboard.writeText(loggedInAccountId),
      disabled: waiting,
      icon: <CopyOutlined />,
    })
    menuItems.push({
      label: 'Log out',
      key: '4',
      onClick: handleSignOut,
      disabled: waiting,
      icon: <LogoutOutlined />,
    })
  } else {
    menuItems.push({
      label: 'Connect NEAR wallet',
      key: '3',
      onClick: handleSignIn,
      disabled: waiting,
      icon: <LoginOutlined />,
    })
  }

  return (
    <HeaderWrapper ref={wrapperRef}>
      <ProfileButton title={loggedInAccountId ?? ''} onClick={onOpenHeader}>
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
            onClick={() => navigate(`/notifications`)}
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
    </HeaderWrapper>
  )
}

export default Header
