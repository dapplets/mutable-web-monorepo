import { ConnectedAccountsRequestStatus } from '@mweb/backend'
import { useState } from 'react'
import { useMutableWeb } from '../mutable-web-context'

export function useGetRequestStatus() {
  const { engine } = useMutableWeb()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getRequestStatus = async (id: number): Promise<ConnectedAccountsRequestStatus | null> => {
    try {
      setIsLoading(true)
      return engine.connectedAccountsService.getRequestStatus(id)
    } catch (e: any) {
      setError('Error in useGetRequestStatus hook: ' + e)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { getRequestStatus, isLoading, error }
}
