import { useQuery } from '@tanstack/react-query'
import { ChainTypes, IConnectedAccountsPair } from '@mweb/backend'
import { useEngine } from '../engine'

export function useGetCAPairs({ networkId, accountId }: { networkId: string; accountId: string }) {
  const { engine } = useEngine()

  const originId = `near/${networkId}`

  const fetch = async () => {
    if (!accountId || !networkId) return null
    const status = await engine.connectedAccountsService.getStatus(accountId, originId)
    return engine.connectedAccountsService.getPairs({
      receiver: {
        account: accountId,
        chain: networkId === 'testnet' ? ChainTypes.NEAR_TESTNET : ChainTypes.NEAR_MAINNET,
        accountActive: status,
      },
      prevPairs: null,
    })
  }

  const { data, isLoading, error } = useQuery<IConnectedAccountsPair[] | null>({
    queryKey: ['connectedAccountsPairs', originId, accountId],
    queryFn: fetch,
    enabled: !!accountId && !!networkId, // Ensure the query only runs when both `accountId` and `networkId` are provided
  })

  return {
    connectedAccountsPairs: data ?? null,
    isLoading,
    error,
  }
}
