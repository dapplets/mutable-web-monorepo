import React, { FC, ReactNode } from 'react'
import { EngineContext, EngineContextState } from './engine-context'
import { IContextNode } from '@mweb/core'

type Props = {
  tree: IContextNode | null
  loggedInAccountId: string | null
  nearNetwork: string
  onConnectWallet: () => Promise<void>
  onDisconnectWallet: () => Promise<void>
  onConnectEthWallet: () => Promise<void>
  onDisconnectEthWallet: () => Promise<void>
  addresses: string[] | null
  walletChainName: string | null
  children?: ReactNode
}

const EngineProvider: FC<Props> = ({
  tree,
  loggedInAccountId,
  nearNetwork,
  onConnectWallet,
  onDisconnectWallet,
  onConnectEthWallet,
  onDisconnectEthWallet,
  addresses,
  walletChainName,
  children,
}) => {
  const state: EngineContextState = {
    tree,
    loggedInAccountId,
    nearNetwork,
    onConnectWallet,
    onDisconnectWallet,
    onConnectEthWallet,
    onDisconnectEthWallet,
    addresses,
    walletChainName,
  }

  return <EngineContext.Provider value={state}>{children}</EngineContext.Provider>
}

export { EngineProvider }
