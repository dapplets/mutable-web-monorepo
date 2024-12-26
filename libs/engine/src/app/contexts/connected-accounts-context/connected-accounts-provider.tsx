import { ChainTypes, IConnectedAccountsPair } from '@mweb/backend'
import { useAccountId } from 'near-social-vm'
import React, { FC, ReactNode } from 'react'
import { useQuery } from '../../hooks/use-query'
import { useMutableWeb } from '../mutable-web-context'
import {
  ConnectedAccountsContext,
  ConnectedAccountsContextState,
} from './connected-accounts-context'
import { useGetCANet } from './use-get-ca-net'
import { useGetCAPairs } from './use-get-ca-pairs'

type Props = {
  children?: ReactNode
}

const ConnectedAccountsProvider: FC<Props> = ({ children }) => {
  const { engine } = useMutableWeb()
  const { connectedAccountsNet, setConnectedAccountsNet } = useGetCANet()
  const { connectedAccountsPairs, setConnectedAccountsPairs } = useGetCAPairs()

  const state: ConnectedAccountsContextState = {
    pairs: connectedAccountsPairs,
    connectedAccountsNet,

    setConnectedAccountsNet,
    setConnectedAccountsPairs,

    // ToDo: add isLoading-s and error-s
    // ToDo: implement following methods. Sepaate to hooks
    getConnectedAccounts: engine.connectedAccountsService.getConnectedAccounts,
    getMinStakeAmount: engine.connectedAccountsService.getMinStakeAmount,
    getPendingRequests: engine.connectedAccountsService.getPendingRequests,
    getVerificationRequest: engine.connectedAccountsService.getVerificationRequest,
    getStatus: engine.connectedAccountsService.getStatus,
    areConnected: engine.connectedAccountsService.areConnected,
    getMainAccount: engine.connectedAccountsService.getMainAccount,
    getRequestStatus: engine.connectedAccountsService.getRequestStatus,
    requestVerification: engine.connectedAccountsService.requestVerification,
  }

  return (
    <ConnectedAccountsContext.Provider value={state}>
      <>{children}</>
    </ConnectedAccountsContext.Provider>
  )
}

export { ConnectedAccountsProvider }
