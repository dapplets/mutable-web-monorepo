import { ChainTypes, IConnectedAccountsPair } from '@mweb/backend'
import { useAccountId } from 'near-social-vm'
import { useEffect, useState } from 'react'
import { useMutableWeb } from '../mutable-web-context'

export function useGetCAPairs() {
  const { engine, config } = useMutableWeb()
  const accountId = useAccountId() // ToDo: use accountId as hook parameter
  const networkId = config.networkId
  const [connectedAccountsPairs, setConnectedAccountsPairs] = useState<
    IConnectedAccountsPair[] | null
  >(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getConnectedAccountsPairs = async () => {
    if (!accountId || !networkId) return
    try {
      setIsLoading(true)
      setError(null)
      const status = await engine.connectedAccountsService.getStatus(accountId, `near/${networkId}`)
      const pairs = await engine.connectedAccountsService.getPairs({
        receiver: {
          account: accountId,
          chain: networkId === 'testnet' ? ChainTypes.NEAR_TESTNET : ChainTypes.NEAR_MAINNET,
          accountActive: status,
        },
        prevPairs: null,
      })
      setConnectedAccountsPairs(pairs)
      setIsLoading(false)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  useEffect(() => {
    getConnectedAccountsPairs()
  }, [engine, config, accountId])

  return {
    connectedAccountsPairs,
    updateConnectedAccountsPairs: getConnectedAccountsPairs,
    isLoading,
    error,
  }
}
