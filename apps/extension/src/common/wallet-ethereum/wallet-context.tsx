import { createContext } from 'react'

export type WalletContextState = {
  addresses: string[] | null
  walletChainName: string | null
}

export const contextDefaultValues: WalletContextState = {
  addresses: null,
  walletChainName: null,
}

export const WalletContext = createContext<WalletContextState>(contextDefaultValues)
