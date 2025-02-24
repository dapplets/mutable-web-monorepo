import { createContext } from 'react'
import { IContextNode } from '@mweb/core'

export type EngineContextState = {
  tree: IContextNode | null
  loggedInAccountId: string | null
  nearNetwork: string
  onConnectWallet: () => Promise<void>
  onDisconnectWallet: () => Promise<void>
  onConnectEthWallet: () => Promise<void>
  onDisconnectEthWallet: () => Promise<void>
  address: string | null
}

export const contextDefaultValues: EngineContextState = {
  tree: null,
  loggedInAccountId: null,
  nearNetwork: '',
  onConnectWallet: async () => {},
  onDisconnectWallet: async () => {},
  onConnectEthWallet: async () => {},
  onDisconnectEthWallet: async () => {},
  address: null,
}

export const EngineContext = createContext<EngineContextState>(contextDefaultValues)
