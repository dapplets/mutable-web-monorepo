import { useState } from 'react'
import { useMutableWeb } from '../mutable-web-context'
import { RequestStatus } from './connected-accounts-context'
import { useConnectedAccounts } from './use-connected-accounts'

export type RequestVerificationProps = {
  firstAccountId: string
  firstOriginId: string
  secondAccountId: string
  secondOriginId: string
  firstProofUrl: string
  isUnlink: boolean
}

export function useConnectAccounts() {
  const { setRequests } = useConnectedAccounts()
  const { engine } = useMutableWeb()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestVerification = async (
    newRequestId: number,
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
      setRequests((requests) =>
        requests.map((request) =>
          request.id !== newRequestId ? request : { ...request, status: RequestStatus.VERIFICATION }
        )
      )
      return result
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unknown error')
      }
      setRequests((requests) =>
        requests.map((request) =>
          request.id !== newRequestId
            ? request
            : {
                ...request,
                status: RequestStatus.FAILED,
                message: (err as Error)?.message ?? 'Unknown error',
              }
        )
      )
      setTimeout(
        () => setRequests((requests) => requests.filter((request) => request.id !== newRequestId)),
        5000
      )
      // throw err // ToDo: handle error???
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { requestVerification, isLoading, error }
}
