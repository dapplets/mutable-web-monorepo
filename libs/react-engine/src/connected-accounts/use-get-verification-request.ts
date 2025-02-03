import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'

export function useGetVerificationRequest(id: number) {
  const { engine } = useEngine()

  const { data, isLoading, error } = useQuery({
    queryKey: ['verificationRequest', id],
    queryFn: () => engine.connectedAccountsService.getVerificationRequest(id),
  })

  return { verificationRequest: data ?? null, isLoading, error }
}
