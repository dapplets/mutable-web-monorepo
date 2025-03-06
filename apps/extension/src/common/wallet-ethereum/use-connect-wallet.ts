import { useCallback, useState } from 'react'
import Background from '../background'

export const useConnectWallet = () => {
  const [isWalletConnecting, setIsWalletConnecting] = useState(false)

  const connectWallet = useCallback(async () => {
    setIsWalletConnecting(true)

    try {
      await Background.connectEthWallet()
    } finally {
      setIsWalletConnecting(false)
    }
  }, [])

  return {
    isWalletConnecting,
    connectWallet,
  }
}
