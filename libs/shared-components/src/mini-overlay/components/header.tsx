import makeBlockie from 'ethereum-blockies-base64'
import React, { FC, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import styled from 'styled-components'
import { ProfileAddress } from '../../common/profile-address'
import { ProfileIcon } from '../../common/profile-icon'
import { ProfileInfo } from '../../common/profile-info'
import { ProfileNetwork } from '../../common/profile-network'
import { useEngine } from '../../contexts/engine-context'
import {
  Bell as BellIcon,
  Connect as ConnectIcon,
  Copy as CopyIcon,
  Disconnect as DisconnectIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  PlayCenterIcon,
} from '../assets/icons'

const HeaderWrapper = styled.div`
  display: flex;
  box-sizing: border-box;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 56px;
  border-radius: 10px;
  padding: 4px 10px;
  background: #fff;
  font-family: sans-serif;
  box-shadow:
    0px 4px 20px 0px #0b576f26,
    0px 4px 5px 0px #2d343c1a;
  gap: 6px;
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

const TextConnect = styled.div`
  color: #02193a;
  font-size: 14px;
  font-weight: 600;
`

const ProfileButton = styled.button<{ isActive?: boolean }>`
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
  cursor: ${({ isActive: active }) => (active ? 'default' : 'pointer')};
  color: ${({ isActive: active }) => (active ? 'white' : 'rgb(122, 129, 139)')};
  background: ${({ isActive: active }) => (active ? 'rgb(56, 75, 255)' : 'rgb(248, 249, 255)')};
  flex-shrink: 0;

  &:hover {
    color: rgb(101, 108, 119);
    background-color: rgb(195, 197, 209);
  }

  &:active {
    color: rgb(84, 90, 101);
    background-color: rgb(173, 175, 187);
  }

  &:disabled {
    opacity: 0.7;
    cursor: default;
  }
`

const Header: FC = () => {
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

  return (
    <HeaderWrapper ref={wrapperRef}>
      {loggedInAccountId ? (
        <>
          <ProfileIcon>
            <img src={makeBlockie(loggedInAccountId)} alt="account blockie image" />
          </ProfileIcon>
          <ProfileInfo styles={{ width: 158 }}>
            <ProfileAddress>{loggedInAccountId}</ProfileAddress>
            <ProfileNetwork>
              {nearNetwork === 'mainnet' ? 'NEAR-Mainnet' : 'NEAR-Testnet'}
            </ProfileNetwork>
          </ProfileInfo>
        </>
      ) : (
        <TextConnect>No wallet connected</TextConnect>
      )}
      <ProfileButton
        isActive={location.pathname === '/main'}
        disabled={waiting}
        onClick={() => navigate(`/main`)}
        title="Home"
      >
        <HomeIcon />
      </ProfileButton>
      <ProfileButton
        isActive={location.pathname === '/profile'}
        data-testid="profile-page-button"
        disabled={waiting}
        onClick={() => navigate(`/profile`)}
        title="Profile"
      >
        <PersonIcon />
      </ProfileButton>
      <ProfileButton
        isActive={location.pathname === '/applications'}
        disabled={waiting}
        onClick={() => navigate(`/applications`)}
        title="Apps"
      >
        <PlayCenterIcon />
      </ProfileButton>
      {loggedInAccountId ? (
        <>
          <ProfileButton
            isActive={location.pathname === '/notifications'}
            disabled={waiting}
            onClick={() => navigate(`/notifications`)}
            title="Notifications"
          >
            <BellIcon />
          </ProfileButton>
          <ProfileButton
            disabled={waiting}
            onClick={() => navigator.clipboard.writeText(loggedInAccountId)}
            title="Copy address"
          >
            <CopyIcon />
          </ProfileButton>
          <ProfileButton disabled={waiting} onClick={handleSignOut} title="Log out">
            <DisconnectIcon />
          </ProfileButton>
        </>
      ) : (
        <ButtonConnectWrapper disabled={waiting} onClick={handleSignIn} title="Connect NEAR wallet">
          {waiting ? (
            <div className="loading"></div>
          ) : (
            <>
              <ConnectIcon />
              Connect
            </>
          )}
        </ButtonConnectWrapper>
      )}
    </HeaderWrapper>
  )
}

export default Header
