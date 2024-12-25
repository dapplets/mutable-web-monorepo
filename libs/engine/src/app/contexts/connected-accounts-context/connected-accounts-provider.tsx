import { ChainTypes, IConnectedAccountsPair } from '@mweb/backend'
import { useAccountId } from 'near-social-vm'
import { FC, ReactNode } from 'react'
import { useQuery } from '../../hooks/use-query'
import { useMutableWeb } from '../mutable-web-context'
import {
  ConnectedAccountsContext,
  ConnectedAccountsContextState,
} from './connected-accounts-context'

type Props = {
  children?: ReactNode
}

const ConnectedAccountsProvider: FC<Props> = ({ children }) => {
  const { engine, config } = useMutableWeb()
  const accountId = useAccountId()
  const networkId = config.networkId

  const {
    data: connectedAccountsNet,
    setData: setConnectedAccountsNet,
    isLoading,
    error,
  } = useQuery<string[] | null>({
    query: async () => {
      if (!accountId) return null
      return engine.connectedAccountsService.getNet(`${accountId}/near/${networkId}`)
    },
    initialData: [],
    deps: [engine, config, accountId],
  })

  const {
    data: connectedAccountsPairs,
    setData: setConnectedAccountsPairs,
    isLoading: isLoading2,
    error: error2,
  } = useQuery<IConnectedAccountsPair[] | null>({
    query: async () => {
      if (!accountId) return null
      const status = await engine.connectedAccountsService.getStatus(accountId, `near/${networkId}`)
      return engine.connectedAccountsService.getPairs({
        receiver: {
          account: accountId,
          chain: networkId === 'testnet' ? ChainTypes.NEAR_TESTNET : ChainTypes.NEAR_MAINNET,
          accountActive: status,
        },
        prevPairs: null,
      })
    },
    initialData: [],
    deps: [engine, config, accountId],
  })

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
