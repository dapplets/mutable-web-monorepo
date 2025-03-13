import React, { FC } from 'react'
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

  & > div:first-child {
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

  &:hover > div {
    color: var(--primary-hover);
    border: 2px solid var(--primary-hover);
  }

  &:active {
    color: var(--primary-pressed);
  }

  &:active > div {
    color: var(--primary-pressed);
    border: 2px solid var(--primary-pressed);
  }
`

export const ConnectMetaMaskButton: FC<{ onConnectEthWallet: () => void }> = ({
  onConnectEthWallet,
}) => {
  return (
    <ConnectMetamaskButton onClick={onConnectEthWallet}>
      <div>+</div>Connect MetaMask
    </ConnectMetamaskButton>
  )
}

export default ConnectMetaMaskButton
