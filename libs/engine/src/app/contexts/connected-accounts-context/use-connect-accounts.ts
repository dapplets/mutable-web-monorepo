import { useState } from 'react'
import { useMutableWeb } from '../mutable-web-context'

export type RequestVerificationProps = {
  firstAccountId: string
  firstOriginId: string
  secondAccountId: string
  secondOriginId: string
  firstProofUrl: string
  isUnlink: boolean
}

export function useConnectAccounts() {
  const { engine } = useMutableWeb()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestVerification = async (
    {
      firstAccountId,
      firstOriginId,
      secondAccountId,
      secondOriginId,
      firstProofUrl,
      isUnlink,
    }: RequestVerificationProps,
    stake?: number
  ): Promise<number | null> => {
    try {
      setIsLoading(true)
      const result = await engine.connectedAccountsService.requestVerification(
        {
          firstAccountId,
          firstOriginId,
          secondAccountId,
          secondOriginId,
          firstProofUrl,
          isUnlink,
        },
        stake
      )
      return result
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unknown error')
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { requestVerification, isLoading, error }
}
