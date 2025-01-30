import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'

export function useMinStakeAmount() {
  const { engine } = useEngine()

  const {
    data: minStakeAmount,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['minStakeAmount'],
    queryFn: () => engine.connectedAccountsService.getMinStakeAmount(),
    initialData: -1,
  })

  return { minStakeAmount, isLoading, error }
}
