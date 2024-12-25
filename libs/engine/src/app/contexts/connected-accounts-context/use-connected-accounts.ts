import { useContext } from 'react'
import { ConnectedAccountsContext } from './connected-accounts-context'

export function useConnectedAccounts() {
  return useContext(ConnectedAccountsContext)
}
