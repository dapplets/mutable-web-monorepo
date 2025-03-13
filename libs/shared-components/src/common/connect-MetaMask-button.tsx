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
  padding: 8px;
  cursor: pointer;
  font-family: var(--font-default);

  .ant-spin {
    height: 15px !important;
    margin-top: 1px !important;
  }

  .plus {
    display: flex;
    box-sizing: border-box;
    border-radius: 50%;
    border: 2px solid var(--primary);
    width: 16px;
    height: 16px;
    align-items: center;
    justify-content: center;
    line-height: 100%;
    font-weight: bold;
    font-size: 14px;
  }

  &:hover {
    color: var(--primary-hover);
  }

  &:hover .plus {
    color: var(--primary-hover);
    border: 2px solid var(--primary-hover);
  }

  &:active {
    color: var(--primary-pressed);
  }

  &:active .plus {
    color: var(--primary-pressed);
    border: 2px solid var(--primary-pressed);
  }
`

export const ConnectMetaMaskButton: FC<{ onConnectEthWallet: () => Promise<void> }> = ({
  onConnectEthWallet,
}) => {
  const [isWaiting, setIsWaiting] = useState(false)
  const handleClick = async () => {
    setIsWaiting(true)
    try {
      await onConnectEthWallet()
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
          <div className="plus">+</div>Connect MetaMask
        </>
      )}
    </ConnectMetamaskButton>
  )
}

export default ConnectMetaMaskButton
