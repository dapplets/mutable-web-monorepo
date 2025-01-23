import { setupWalletSelector, WalletSelector } from '@near-wallet-selector/core'
import { EventEmitter as NEventEmitter } from 'events'
import React, { FC, ReactNode, useEffect } from 'react'
import browser from 'webextension-polyfill'
import { ExtensionStorage } from '../extension-storage'
import { setupWallet } from './wallet'
import { WalletContext, WalletContextState } from './wallet-context'
import Background from '../background'

type Props = {
  children?: ReactNode
}

const WalletProvider: FC<Props> = ({ children }) => {
  const [networkId, setNetworkId] = React.useState<string | null>(null)
  const [selector, setSelector] = React.useState<WalletSelector | null>(null)
  const [accountId, setAccountId] = React.useState<string | null>(null)

  useEffect(() => {
    Background.getCurrentNetwork().then(setNetworkId)
  }, [])

  useEffect(() => {
    if (!networkId) return

    const eventEmitter = new NEventEmitter()

    // The wallet selector looks like an unnecessary abstraction layer over the "mutable-web-extension" wallet
    // but we have to use it because near-social-vm uses not only a wallet object, but also a selector state
    // object and its Observable for event subscription
    setupWalletSelector({
      network: networkId as any, // ToDo: fix
      // The storage is faked because it's not necessary. The selected wallet ID is hardcoded below
      storage: new ExtensionStorage(`wallet-selector:${networkId}`),
      modules: [setupWallet({ eventEmitter })],
    })
      .then((selector) => {
        // Use background wallet by default
        const wallet = selector.wallet
        selector.wallet = () => wallet('mutable-web-extension')
        return selector
      })
      .then((selector) =>
        selector.wallet().then((wallet) =>
          wallet.getAccounts().then((accounts) => {
            setSelector(selector)
            setAccountId(accounts[0]?.accountId)
          })
        )
      )

    const listener = (message: any): undefined => {
      if (!message || !message.type) return
      if (message.type === 'signedIn') {
        eventEmitter.emit('signedIn', message.params)
      } else if (message.type === 'signedOut') {
        eventEmitter.emit('signedOut')
      }
    }

    const signInListener = ({ accounts }: any) => {
      setAccountId(accounts[0]?.accountId)
    }

    const signOutListener = () => {
      setAccountId(null)
    }

    eventEmitter.on('signedIn', signInListener)
    eventEmitter.on('signedOut', signOutListener)

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
      eventEmitter.removeAllListeners()
      if (port) {
        port.onMessage.removeListener(listener)
        port.disconnect()
      }
    }
  }, [networkId])

  if (!networkId) return null

  const state: WalletContextState = {
    selector,
    networkId,
    accountId,
  }

  return <WalletContext.Provider value={state}>{children}</WalletContext.Provider>
}

export { WalletProvider }
