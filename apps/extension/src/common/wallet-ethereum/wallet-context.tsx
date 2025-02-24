import { createContext } from 'react'
import { useConnectWallet } from './use-connect-wallet'
import { useDisconnectWallet } from './use-disconnect-wallet'

export type WalletContextState = {
  // selector: WalletSelector | null
  // networkId: string
  address: string | null
  useConnectEthWallet: () => {
    isWalletConnecting: boolean
    connectWallet: () => Promise<void>
  }
  useDisconnectEthWallet: () => {
    isWalletDisconnecting: boolean
    disconnectWallet: () => Promise<void>
  }
}

export const contextDefaultValues: WalletContextState = {
  // selector: null,
  // networkId: 'mainnet',
  address: null,
  useConnectEthWallet: useConnectWallet,
  useDisconnectEthWallet: useDisconnectWallet,
}

export const WalletContext = createContext<WalletContextState>(contextDefaultValues)
