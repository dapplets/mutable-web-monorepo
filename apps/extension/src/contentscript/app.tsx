import { EngineConfig } from '@mweb/backend'
import { customElements, MutableWebProvider, ShadowDomWrapper } from '@mweb/engine'
import { useInitNear, EthersProviderContext } from 'near-social-vm'
import React, { FC, useMemo, useEffect } from 'react'
import browser from 'webextension-polyfill'
import { ExtensionStorage } from '../common/extension-storage'
import { networkConfigs } from '../common/networks'
import { useWallet } from '../common/wallet-context'
import { MultitablePanel } from './multitable-panel/multitable-panel'
import { WildcardEventEmitter } from '../common/wildcard-event-emitter'
import Background from '../common/background'
import {
  SimplifiedEIP1193Provider,
  ProviderEvent,
  ConnectListener,
  DisconnectListener,
  MessageListener,
  ChainListener,
  AccountsListener,
} from '../common/types'

export const App: FC<{
  defaultMutationId?: string | null
  devServerUrl?: string | null
}> = ({ defaultMutationId, devServerUrl }) => {
  const { selector, networkId } = useWallet()

  const { initNear } = useInitNear()

  const eventEmitter = new WildcardEventEmitter()

  const ethersProviderContext = useMemo<{
    provider: SimplifiedEIP1193Provider
  }>(
    () => ({
      provider: {
        on: (
          event: ProviderEvent,
          listener:
            | ConnectListener
            | DisconnectListener
            | MessageListener
            | ChainListener
            | AccountsListener
        ): void => {
          eventEmitter.on(event, listener)
        },
        removeListener: (
          event: ProviderEvent,
          listener:
            | ConnectListener
            | DisconnectListener
            | MessageListener
            | ChainListener
            | AccountsListener
        ): void => {
          eventEmitter.removeListener(event, listener)
        },
        request: ({ method, params }: { method: string; params: any[] }) =>
          Background.sendEthCustomRequest(method, params),
      },
    }),
    []
  )

  useEffect(() => {
    const listener = (message: any): undefined => {
      if (!message || !message.type) return
      switch (message.type) {
        case 'signedInEthereum':
          eventEmitter.emit('signedInEthereum', message.params)
          break
        case 'signedOutEthereum':
          eventEmitter.emit('signedOutEthereum', message.params)
          break
        case 'ethAccountsChanged':
          eventEmitter.emit('ethAccountsChanged', message.params)
          break
        case 'ethChainChanged':
          eventEmitter.emit('ethChainChanged', message.params)
          break
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

  useEffect(() => {
    if (initNear && selector && networkId in networkConfigs) {
      const { nodeUrl } = networkConfigs[networkId]

      initNear({
        networkId,
        config: { nodeUrl },
        selector: Promise.resolve(selector),
        features: {
          skipTxConfirmationPopup: true,
        },
        customElements,
      })
    }
  }, [initNear, selector, networkId])

  if (!selector) return null

  const bootstrapCssUrl = browser.runtime.getURL('bootstrap.min.css')

  // ToDo: move to MutableWebContext
  const engineConfig: EngineConfig = {
    networkId,
    gatewayId: 'mutable-web-extension',
    selector,
    storage: new ExtensionStorage(`mweb:${networkId}`),
    bosElementStyleSrc: bootstrapCssUrl,
    eventEmitter,
  }

  return (
    <EthersProviderContext.Provider value={ethersProviderContext}>
      <MutableWebProvider
        config={engineConfig}
        defaultMutationId={defaultMutationId}
        devServerUrl={devServerUrl}
      >
        <ShadowDomWrapper stylesheetSrc={engineConfig.bosElementStyleSrc}>
          <MultitablePanel />
        </ShadowDomWrapper>
      </MutableWebProvider>
    </EthersProviderContext.Provider>
  )
}
