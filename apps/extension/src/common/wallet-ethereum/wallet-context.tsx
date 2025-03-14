import { createContext } from 'react'

export type WalletContextState = {
  address: string | null
  addresses: string[] | null
  walletChainName: string | null
}

export const contextDefaultValues: WalletContextState = {
  address: null,
  addresses: null,
  walletChainName: null,
}

export const WalletContext = createContext<WalletContextState>(contextDefaultValues)
