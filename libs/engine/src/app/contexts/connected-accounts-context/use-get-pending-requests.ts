import { useState } from 'react'
import { useMutableWeb } from '../mutable-web-context'

export function useGetPendingRequests() {
  const { engine } = useMutableWeb()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getPendingRequests = async (): Promise<number[] | null> => {
    try {
      setIsLoading(true)
      return engine.connectedAccountsService.getPendingRequests()
    } catch (e: any) {
      setError('Error in useGetPendingRequests hook: ' + e)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { getPendingRequests, isLoading, error }
}
