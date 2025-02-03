import { WalletSelector } from '@near-wallet-selector/core'
import { createContext } from 'react'

export type WalletContextState = {
  selector: WalletSelector | null
  networkId: string
  accountId: string | null
}

export const contextDefaultValues: WalletContextState = {
  selector: null,
  networkId: 'mainnet',
  accountId: null,
}

export const WalletContext = createContext<WalletContextState>(contextDefaultValues)
