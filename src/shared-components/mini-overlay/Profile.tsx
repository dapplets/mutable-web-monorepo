import makeBlockie from 'ethereum-blockies-base64'
import React, { FC, useRef, useState } from 'react'
import styled from 'styled-components'
import { useOutside } from '../hooks/use-outside'

const ProfileWrapper = styled.div`
  display: flex;
  position: absolute;
  right: 70px;
  top: 0;
  box-sizing: border-box;
  justify-content: space-between;
  align-items: center;
  width: 300px;
  height: 56px;
  border-radius: 10px;
  padding: 4px 10px;
  background: #fff;
  box-shadow:
    1px 1px 4px 0px rgba(45, 52, 60, 0.3),
    0 4px 5px 0 rgba(45, 52, 60, 0.1);
  font-family: sans-serif;
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

const ButtonCopy = styled.button`
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
  background: #f8f9ff;
  border-radius: 50%;
  transition: all 0.15s ease;

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
  }
`

const ButtonDisconnect = styled.button`
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
  background: #f8f9ff;
  border-radius: 50%;
  transition: all 0.15s ease;

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
  }
`

const iconConnect = (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M15 3.33301H5.00001C3.15834 3.33301 1.66667 4.82467 1.66667 6.66634V13.333C1.66667 15.1747 3.15834 16.6663 5.00001 16.6663H15C16.8417 16.6663 18.3333 15.1747 18.3333 13.333V6.66634C18.3333 4.82467 16.8417 3.33301 15 3.33301ZM13.45 11.4747C13.25 11.6413 12.975 11.708 12.7167 11.6413L3.45834 9.37467C3.70834 8.76634 4.3 8.33301 5.00001 8.33301H15C15.5583 8.33301 16.05 8.61634 16.3583 9.03301L13.45 11.4747ZM5.00001 4.99967H15C15.9167 4.99967 16.6667 5.74967 16.6667 6.66634V7.12467C16.175 6.84134 15.6083 6.66634 15 6.66634H5.00001C4.39167 6.66634 3.82501 6.84134 3.33334 7.12467V6.66634C3.33334 5.74967 4.08334 4.99967 5.00001 4.99967Z"
      fill="white"
    />
  </svg>
)

const IconCopy = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="12" fill="#F8F9FF" />
    <path
      d="M16.7692 10H11.2308C10.551 10 10 10.551 10 11.2308V16.7692C10 17.449 10.551 18 11.2308 18H16.7692C17.449 18 18 17.449 18 16.7692V11.2308C18 10.551 17.449 10 16.7692 10Z"
      stroke="#7A818B"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.84615 14H7.23077C6.90435 14 6.5913 13.8703 6.36048 13.6395C6.12967 13.4087 6 13.0957 6 12.7692V7.23077C6 6.90435 6.12967 6.5913 6.36048 6.36048C6.5913 6.12967 6.90435 6 7.23077 6H12.7692C13.0957 6 13.4087 6.12967 13.6395 6.36048C13.8703 6.5913 14 6.90435 14 7.23077V7.84615"
      stroke="#7A818B"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const IconDisconnect = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="12" fill="#F8F9FF" />
    <path
      d="M15.8333 14.75L18.5 12M18.5 12L15.8333 9.25M18.5 12H9.16667M13.1667 14.75V15.4375C13.1667 15.9845 12.956 16.5091 12.5809 16.8959C12.2058 17.2827 11.6971 17.5 11.1667 17.5H8.5C7.96957 17.5 7.46086 17.2827 7.08579 16.8959C6.71071 16.5091 6.5 15.9845 6.5 15.4375V8.5625C6.5 8.01549 6.71071 7.49089 7.08579 7.10409C7.46086 6.7173 7.96957 6.5 8.5 6.5H11.1667C11.6971 6.5 12.2058 6.7173 12.5809 7.10409C12.956 7.49089 13.1667 8.01549 13.1667 8.5625V9.25"
      stroke="#7A818B"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export interface IWalletConnect {
  nearNetwork: 'mainnet' | 'testnet'
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
}

export interface IProfileProps extends IWalletConnect {
  accountId: string | null
  closeProfile: () => void
}

const Profile: FC<IProfileProps> = ({
  accountId,
  closeProfile,
  connectWallet,
  disconnectWallet,
  nearNetwork,
}) => {
  const [waiting, setWaiting] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)
  useOutside(wrapperRef, closeProfile)

  const handleSignIn = async () => {
    setWaiting(true)
    try {
      await connectWallet()
    } finally {
      setWaiting(false)
    }
  }

  const handleSignOut = async () => {
    setWaiting(true)
    try {
      await disconnectWallet()
    } finally {
      setWaiting(false)
    }
  }

  return (
    <ProfileWrapper ref={wrapperRef}>
      {accountId ? (
        <>
          <ProfileIcon>
            <img src={makeBlockie(accountId)} alt="account blockie image" />
          </ProfileIcon>
          <ProfileInfo>
            <ProfileAddress>{accountId}</ProfileAddress>
            <ProfileNetwork>
              {nearNetwork === 'mainnet' ? 'NEAR-Mainnet' : 'NEAR-Testnet'}
            </ProfileNetwork>
          </ProfileInfo>
          <ButtonCopy disabled={waiting} onClick={() => navigator.clipboard.writeText(accountId)}>
            <IconCopy />
          </ButtonCopy>
          <ButtonDisconnect disabled={waiting} onClick={handleSignOut}>
            <IconDisconnect />
          </ButtonDisconnect>
        </>
      ) : (
        <>
          <TextConnect>No wallet connected</TextConnect>
          <ButtonConnectWrapper disabled={waiting} onClick={handleSignIn}>
            {waiting ? <div className="loading"></div> : <>{iconConnect}Connect</>}
          </ButtonConnectWrapper>
        </>
      )}
    </ProfileWrapper>
  )
}

export default Profile
