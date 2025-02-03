import { useContext } from 'react'
import { WalletContext } from './wallet-context'

export function useWallet() {
  return useContext(WalletContext)
}
