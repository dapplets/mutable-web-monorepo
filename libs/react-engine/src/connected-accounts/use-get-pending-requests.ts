import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'

export function useGetPendingRequests() {
  const { engine } = useEngine()

  const { data, isLoading, error } = useQuery({
    queryKey: ['pendingRequests'],
    queryFn: () => engine.connectedAccountsService.getPendingRequests(),
  })

  return { pendingRequests: data ?? [], isLoading, error }
}
