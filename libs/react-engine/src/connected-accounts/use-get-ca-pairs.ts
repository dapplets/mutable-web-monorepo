import { useQuery } from '@tanstack/react-query'
import { ChainTypes, IConnectedAccountsPair } from '@mweb/backend'
import { useEngine } from '../engine'

export function useGetCAPairs({ chain, accountId }: { chain: ChainTypes; accountId: string }) {
  const { engine } = useEngine()

  const originId =
    chain === ChainTypes.ETHEREUM_SEPOLIA || chain === ChainTypes.ETHEREUM_XDAI
      ? 'ethereum' // ToDo: hardcoded
      : chain // ToDo: hardcoded

  const fetch = async () => {
    if (!accountId || !originId) return null
    const status = await engine.connectedAccountsService.getStatus(accountId, originId)
    return engine.connectedAccountsService.getPairs({
      receiver: {
        account: accountId,
        chain,
        accountActive: status,
      },
      prevPairs: null,
    })
  }

  const { data, isLoading, error } = useQuery<IConnectedAccountsPair[] | null>({
    queryKey: ['connectedAccountsPairs', originId, accountId],
    queryFn: fetch,
    enabled: !!accountId && !!originId, // Ensure the query only runs when both `accountId` and `networkId` are provided
  })

  return {
    connectedAccountsPairs: data ?? null,
    isLoading,
    error,
  }
}
