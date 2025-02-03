import { useAccountId } from 'near-social-vm'
import { useQuery } from '../../hooks/use-query'
import { useMutableWeb } from '../mutable-web-context'
import { ChainTypes, IConnectedAccountsPair } from '@mweb/backend'

export function useGetCAPairs() {
  const { engine, config } = useMutableWeb()
  const accountId = useAccountId() // ToDo: use accountId as hook parameter
  const networkId = config.networkId

  const {
    data: connectedAccountsPairs,
    setData: setConnectedAccountsPairs,
    isLoading,
    error,
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

  return { connectedAccountsPairs, setConnectedAccountsPairs, isLoading, error }
}
