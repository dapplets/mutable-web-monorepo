import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'

export function useGetMinStake() {
  const { engine } = useEngine()

  const { data, isLoading, error } = useQuery({
    queryKey: ['minStakeAmount'],
    queryFn: () => engine.connectedAccountsService.getMinStakeAmount(),
  })

  return { minStakeAmount: data ?? -1, isLoading, error }
}
