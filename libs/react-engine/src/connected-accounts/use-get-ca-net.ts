import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { ChainTypes } from '@mweb/backend'

export function useGetCANet({ chain, accountId }: { chain: ChainTypes; accountId: string }) {
  const { engine } = useEngine()

  const originId =
    chain === ChainTypes.ETHEREUM_SEPOLIA || chain === ChainTypes.ETHEREUM_XDAI
      ? 'ethereum' // ToDo: hardcoded
      : chain // ToDo: hardcoded

  const { data, isLoading, error } = useQuery({
    queryKey: ['connectedAccountsNet', originId, accountId],
    queryFn: async () => {
      if (!accountId || !originId) return null
      return engine.connectedAccountsService.getNet(`${accountId}/${originId}`) // ToDo: hardcoded
    },
    enabled: !!accountId && !!originId, // Only fetch when both values exist
  })

  return { connectedAccountsNet: data ?? null, isLoading, error }
}
