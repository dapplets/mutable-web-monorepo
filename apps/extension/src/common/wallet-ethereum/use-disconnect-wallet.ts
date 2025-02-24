import { useCallback, useState } from 'react'
import Background from '../background'

export const useDisconnectWallet = () => {
  const [isWalletDisconnecting, setIsWalletDisconnecting] = useState(false)

  const disconnectWallet = useCallback(async () => {
    setIsWalletDisconnecting(true)

    try {
      await Background.disconnectEthWallet()
    } finally {
      setIsWalletDisconnecting(false)
    }
  }, [])

  return {
    isWalletDisconnecting,
    disconnectWallet,
  }
}
