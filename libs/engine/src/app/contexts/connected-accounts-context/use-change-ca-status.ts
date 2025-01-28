import { useState } from 'react'
import { useMutableWeb } from '../mutable-web-context'
import { useConnectedAccounts } from './use-connected-accounts'

export function useChangeCAStatus() {
  const { engine } = useMutableWeb()
  const { updateConnectedAccountsPairs } = useConnectedAccounts()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeCAStatus = async (accountId: string, originId: string): Promise<void> => {
    try {
      setError(null)
      setIsLoading(true)
      const status = await engine.connectedAccountsService.getStatus(accountId, originId)
      await engine.connectedAccountsService.changeStatus(accountId, originId, !status)
      await updateConnectedAccountsPairs()
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
