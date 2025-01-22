import makeBlockie from 'ethereum-blockies-base64'
import React, { FC, useRef, useState } from 'react'
import styled from 'styled-components'
import cn from 'classnames'
import { useLocation, useNavigate } from 'react-router'
import { useEngine } from '../../contexts/engine-context'
import {
  Connect as ConnectIcon,
  Copy as CopyIcon,
  Disconnect as DisconnectIcon,
  Person as PersonIcon,
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

const ProfileIcon = styled.div`
  display: flex;
  box-sizing: border-box;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid #e2e2e5;

  img {
    object-fit: cover;
  }
`

const ProfileInfo = styled.div`
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  align-items: flex-start;
  width: 158px;
  overflow: hidden;
`

const ProfileAddress = styled.span`
  display: inline-block;
  box-sizing: border-box;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #02193a;
  font-size: 16px;
  font-weight: 600;
  width: 100%;
`

const ProfileNetwork = styled.span`
  display: inline-block;
  box-sizing: border-box;
  font-size: 12px;
  color: #7a818b;
  position: relative;
  padding-left: 12px;

  &::before {
    position: absolute;
    content: '';
    display: block;
    top: 3px;
    left: 0;
    background: #6bea87;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
`

const ProfileButton = styled.button`
  display: flex;
  box-sizing: border-box;
  overflow: hidden;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  padding: 0;
  outline: none;
  border: none;
  border-radius: 50%;
  transition: all 0.15s ease;
  color: rgb(122, 129, 139);
  background: rgb(248, 249, 255);

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

  &.active {
    color: white !important;
    background-color: rgb(56, 75, 255) !important;
    cursor: default;
  }
`

const HeaderButton = styled.button`
  display: flex;
  box-sizing: border-box;
  overflow: hidden;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  padding: 0;
  outline: none;
  border: none;
  border-radius: 50%;
  transition: all 0.15s ease;
  background: #f8f9ff;

  svg {
    rect {
      transition: all 0.15s ease;
    }
    path {
      transition: all 0.15s ease;
    }
  }

  &:hover {
    svg {
      rect {
        fill: rgb(195 197 209);
      }
      path {
        stroke: rgb(101 108 119);
      }
    }
  }

  &:active {
    svg {
      rect {
        fill: rgb(173 175 187);
      }
      path {
        stroke: rgb(84 90 101);
      }
    }
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
          <ProfileInfo>
            <ProfileAddress>{loggedInAccountId}</ProfileAddress>
            <ProfileNetwork>
              {nearNetwork === 'mainnet' ? 'NEAR-Mainnet' : 'NEAR-Testnet'}
            </ProfileNetwork>
          </ProfileInfo>
          <ProfileButton
            className={cn({ active: location.pathname === '/system/profile' })}
            data-testid="profile-page-button"
            disabled={waiting}
            onClick={() => location.pathname !== '/system/profile' && navigate(`/system/profile`)}
          >
            <PersonIcon />
          </ProfileButton>
          <HeaderButton
            disabled={waiting}
            onClick={() => navigator.clipboard.writeText(loggedInAccountId)}
          >
            <CopyIcon />
          </HeaderButton>
          <HeaderButton disabled={waiting} onClick={handleSignOut}>
            <DisconnectIcon />
          </HeaderButton>
        </>
      ) : (
        <>
          <TextConnect>No wallet connected</TextConnect>
          <ButtonConnectWrapper disabled={waiting} onClick={handleSignIn}>
            {waiting ? (
              <div className="loading"></div>
            ) : (
              <>
                <ConnectIcon />
                Connect
              </>
            )}
          </ButtonConnectWrapper>
        </>
      )}
    </HeaderWrapper>
  )
}

export default Header
