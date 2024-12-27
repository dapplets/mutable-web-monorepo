import { useAccountId } from 'near-social-vm'
import { useQuery } from '../../hooks/use-query'
import { useMutableWeb } from '../mutable-web-context'

export function useGetCANet() {
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
    deps: [engine, accountId],
  })

  return { connectedAccountsNet, setConnectedAccountsNet, isLoading, error }
}
