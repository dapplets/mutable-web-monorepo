import { useCallback, useState } from 'react'
import Background from '../background'

export const useConnectWallet = () => {
  const [isWalletConnecting, setIsWalletConnecting] = useState(false)

  const connectWallet = useCallback(async () => {
    console.log('in connectWallet hook')
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
