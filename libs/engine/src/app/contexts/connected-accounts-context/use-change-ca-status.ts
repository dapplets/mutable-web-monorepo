import { useState } from 'react'
import { useMutableWeb } from '../mutable-web-context'
import { useConnectedAccounts } from './use-connected-accounts'

export function useChangeCAStatus() {
  const { engine } = useMutableWeb()
  const { setConnectedAccountsPairs } = useConnectedAccounts()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeCAStatus = async (accountId: string, originId: string): Promise<void> => {
    try {
      setIsLoading(true)
      const status = await engine.connectedAccountsService.getStatus(accountId, originId)

      const result = await engine.connectedAccountsService.changeStatus(
        accountId,
        originId,
        !status
      )

      setConnectedAccountsPairs(
        (pairs) =>
          pairs?.map((pair) => {
            if (pair.firstAccount.name === accountId && pair.firstAccount.origin === originId) {
              pair.firstAccount.accountActive = !status
            } else if (pair.firstAccount.accountActive) {
              pair.firstAccount.accountActive = false
            }
            if (pair.secondAccount.name === accountId && pair.secondAccount.origin === originId) {
              pair.secondAccount.accountActive = !status
            } else if (pair.secondAccount.accountActive) {
              pair.secondAccount.accountActive = false
            }
            return pair
          }) ?? null
      )
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

  return { changeCAStatus, isLoading, error }
}
