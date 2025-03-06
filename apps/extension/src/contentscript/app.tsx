import { EngineConfig } from '@mweb/backend'
import { customElements, MutableWebProvider, ShadowDomWrapper } from '@mweb/engine'
import { useInitNear, EthersProviderContext } from 'near-social-vm'
import React, { FC, useEffect, useMemo } from 'react'
import browser from 'webextension-polyfill'
import { ExtensionStorage } from '../common/extension-storage'
import { networkConfigs } from '../common/networks'
import { useWallet } from '../common/wallet-context'
import { MultitablePanel } from './multitable-panel/multitable-panel'
import { WildcardEventEmitter } from '../common/wildcard-event-emitter'
import Background from '../common/background'

export const App: FC<{
  defaultMutationId?: string | null
  devServerUrl?: string | null
}> = ({ defaultMutationId, devServerUrl }) => {
  const { selector, networkId } = useWallet()

  const { initNear } = useInitNear()

  const ethersProviderContext = useMemo(
    () => ({
      provider: {
        request: ({ method, params }: { method: string; params: any[] }) =>
          Background.sendEthCustomRequest(method, params),
      },
    }),
    []
  )

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

  const eventEmitter = new WildcardEventEmitter()

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
