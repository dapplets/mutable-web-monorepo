import { createContext } from 'react'
import { useConnectWallet } from './use-connect-wallet'

export type WalletContextState = {
  // selector: WalletSelector | null
  // networkId: string
  address: string | null
  useConnectEthWallet: () => {
    isWalletConnecting: boolean
    connectWallet: () => Promise<void>
  }
}

export const contextDefaultValues: WalletContextState = {
  // selector: null,
  // networkId: 'mainnet',
  address: null,
  useConnectEthWallet: useConnectWallet,
}

export const WalletContext = createContext<WalletContextState>(contextDefaultValues)
