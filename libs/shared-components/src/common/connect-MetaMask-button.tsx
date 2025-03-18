import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { Spin } from 'antd'
import React, { FC, useState } from 'react'
import styled from 'styled-components'

const ConnectMetamaskButton = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 4px;
  border: none;
  background: none;
  transition: all 0.2s ease;
  color: var(--primary);
  padding: 8px !important;
  cursor: pointer;
  font-family: var(--font-default);

  p {
    margin: 0;
  }

  .ant-spin {
    height: 15px !important;
    margin-top: 1px !important;
  }

  &:hover {
    color: var(--primary-hover);
  }

  &:active {
    color: var(--primary-pressed);
  }
`

const MetaMaskButton: FC<{ text: string; icon: React.ReactNode; onClick: () => Promise<void> }> = ({
  text,
  icon,
  onClick,
}) => {
  const [isWaiting, setIsWaiting] = useState(false)
  const handleClick = async () => {
    setIsWaiting(true)
    try {
      await onClick()
    } catch (e) {
      console.log(e)
    } finally {
      setIsWaiting(false)
    }
  }
  return (
    <ConnectMetamaskButton onClick={handleClick}>
      {isWaiting ? (
        <Spin size="small" />
      ) : (
        <>
          {icon}
          <p>{text}</p>
        </>
      )}
    </ConnectMetamaskButton>
  )
}

export const ConnectMetaMaskButton: FC<{ onConnectEthWallet: () => Promise<void> }> = ({
  onConnectEthWallet,
}) => {
  return (
    <MetaMaskButton
      text="Connect MetaMask"
      icon={<PlusCircleOutlined />}
      onClick={onConnectEthWallet}
    />
  )
}

export const DisconnectMetaMaskButton: FC<{ onDisconnectEthWallet: () => Promise<void> }> = ({
  onDisconnectEthWallet,
}) => {
  return (
    <MetaMaskButton
      text="Disonnect MetaMask"
      icon={<MinusCircleOutlined />}
      onClick={onDisconnectEthWallet}
    />
  )
}
