// import { setupWalletSelector, WalletSelector } from '@near-wallet-selector/core'
// import { EventEmitter as NEventEmitter } from 'events'
import React, { FC, ReactNode, useEffect } from 'react'
import browser from 'webextension-polyfill'
// import { ExtensionStorage } from '../extension-storage'
// import { setupWallet } from './wallet'
import { WalletContext, WalletContextState } from './wallet-context'
import Background from '../background'

type Props = {
  children?: ReactNode
}

const WalletProvider: FC<Props> = ({ children }) => {
  const [address, setAddress] = React.useState<string | null>(null)
  const [addresses, setAddresses] = React.useState<string[] | null>(null)
  const [walletChainName, setWalletChainName] = React.useState<string | null>(null)

  useEffect(() => {
    Background.getEthAddress().then(setAddress)
    Background.getEthAddresses().then(setAddresses)
    Background.getEthWalletChainName().then(setWalletChainName)
  }, [])

  useEffect(() => {
    const listener = (message: any): undefined => {
      if (!message || !message.type) return
      if (
        message.type === 'signedInEthereum' ||
        message.type === 'signedOutEthereum' ||
        message.type === 'ethAccountsChanged'
      ) {
        setAddress(message.params.account ?? null)
        setAddresses(message.params.accounts)
      } else if (message.type === 'ethChainChanged') {
        setWalletChainName(message.params.chainName)
      }
    }

    let port: browser.Runtime.Port | null = null

    const connect = () => {
      port = browser.runtime.connect({ name: 'port-from-page' })
      port.onMessage.addListener(listener)

      port.onDisconnect.addListener(() => {
        // Delay before reconnecting to prevent immediate retries in rapid succession
        // ToDo: find a better solution
        setTimeout(connect, 1000)
      })
    }

    connect()

    return () => {
      if (port) {
        port.onMessage.removeListener(listener)
        port.disconnect()
      }
    }
  }, [])

  const state: WalletContextState = {
    address,
    addresses,
    walletChainName,
  }

  return <WalletContext.Provider value={state}>{children}</WalletContext.Provider>
}

export { WalletProvider }
