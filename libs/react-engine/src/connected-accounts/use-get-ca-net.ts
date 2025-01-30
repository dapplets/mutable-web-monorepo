import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'

export function useGetCANet({ networkId, accountId }: { networkId: string; accountId: string }) {
  const { engine } = useEngine()

  const { data, isLoading, error } = useQuery({
    queryKey: ['connectedAccountsNet', networkId, accountId],
    queryFn: async () => {
      if (!accountId || !networkId) return null
      return engine.connectedAccountsService.getNet(`${accountId}/near/${networkId}`)
    },
    enabled: !!accountId && !!networkId, // Only fetch when both values exist
  })

  return { connectedAccountsNet: data ?? null, isLoading, error }
}
