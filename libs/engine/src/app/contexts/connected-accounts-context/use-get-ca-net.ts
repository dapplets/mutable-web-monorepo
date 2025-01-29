import { useAccountId } from 'near-social-vm'
import { useEffect, useState } from 'react'
import { useMutableWeb } from '../mutable-web-context'

export function useGetCANet() {
  const { engine, config } = useMutableWeb()
  const accountId = useAccountId() // ToDo: use accountId as hook parameter
  const networkId = config.networkId

  const [connectedAccountsNet, setConnectedAccountsNet] = useState<string[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getConnectedAccountsNet = async () => {
    if (!accountId || !networkId) return
    try {
      setIsLoading(true)
      setError(null)
      const net = await engine.connectedAccountsService.getNet(`${accountId}/near/${networkId}`)
      setConnectedAccountsNet(net)
      setIsLoading(false)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  useEffect(() => {
    getConnectedAccountsNet()
  }, [engine, config, accountId])

  return {
    connectedAccountsNet,
    updateConnectedAccountsNet: getConnectedAccountsNet,
    isLoading,
    error,
  }
}
