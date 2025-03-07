import { createContext } from 'react'

export type WalletContextState = {
  address: string | null
  addresses: string[] | null
  walletChainId: number | null
}

export const contextDefaultValues: WalletContextState = {
  address: null,
  addresses: null,
  walletChainId: null,
}

export const WalletContext = createContext<WalletContextState>(contextDefaultValues)
