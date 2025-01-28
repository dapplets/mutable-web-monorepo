import { TConnectedAccountsVerificationRequestInfo } from '@mweb/backend'
import { useState } from 'react'
import { useMutableWeb } from '../mutable-web-context'

export function useGetVerificationRequest() {
  const { engine } = useMutableWeb()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getVerificationRequest = async (
    id: number
  ): Promise<TConnectedAccountsVerificationRequestInfo | null> => {
    try {
      setIsLoading(true)
      return engine.connectedAccountsService.getVerificationRequest(id)
    } catch (e: any) {
      setError('Error in useGetVerificationRequest hook: ' + e)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { getVerificationRequest, isLoading, error }
}
