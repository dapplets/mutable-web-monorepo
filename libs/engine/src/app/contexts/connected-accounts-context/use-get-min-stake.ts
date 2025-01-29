import { useQuery } from '../../hooks/use-query'
import { useMutableWeb } from '../mutable-web-context'

export function getMinStakeAmount() {
  const { engine } = useMutableWeb()

  const {
    data: minStakeAmount,
    isLoading,
    error,
  } = useQuery<number | null>({
    query: async () => {
      return engine.connectedAccountsService.getMinStakeAmount()
    },
    initialData: -1,
    deps: [engine],
  })

  return { minStakeAmount, isLoading, error }
}
