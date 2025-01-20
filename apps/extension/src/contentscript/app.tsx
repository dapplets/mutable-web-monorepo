import { EngineConfig } from '@mweb/backend'
import { customElements, MutableWebProvider, ShadowDomWrapper } from '@mweb/engine'
import { useInitNear } from 'near-social-vm'
import React, { FC, useEffect } from 'react'
import browser from 'webextension-polyfill'
import { ExtensionStorage } from '../common/extension-storage'
import { networkConfigs } from '../common/networks'
import { useWallet, WalletProvider } from '../common/wallet-context'
import { MultitablePanel } from './multitable-panel/multitable-panel'
import { Core } from '@mweb/core'

export const App: FC<{
  core: Core
  defaultMutationId?: string | null
  devServerUrl?: string | null
}> = ({ core, defaultMutationId, devServerUrl }) => {
  const { selector, networkId } = useWallet()

  // ToDo: fix
  // @ts-ignore
  const networkConfig = networkConfigs[networkId]

  const { initNear } = useInitNear()

  useEffect(() => {
    if (initNear && selector) {
      initNear({
        networkId: networkConfig.networkId,
        config: {
          nodeUrl: networkConfig.nodeUrl,
        },
        selector: Promise.resolve(selector),
        features: {
          skipTxConfirmationPopup: true,
        },
        customElements,
      })
    }
  }, [initNear, selector])

  if (!selector) return null

  const bootstrapCssUrl = browser.runtime.getURL('bootstrap.min.css')

  // ToDo: move to MutableWebContext
  const engineConfig: EngineConfig = {
    networkId,
    gatewayId: 'mutable-web-extension',
    selector,
    storage: new ExtensionStorage(`mweb:${networkId}`),
    bosElementStyleSrc: bootstrapCssUrl,
  }

  return (
    <WalletProvider networkId={networkId}>
      <MutableWebProvider
        core={core}
        config={engineConfig}
        defaultMutationId={defaultMutationId}
        devServerUrl={devServerUrl}
      >
        <ShadowDomWrapper stylesheetSrc={engineConfig.bosElementStyleSrc}>
          <MultitablePanel />
        </ShadowDomWrapper>
      </MutableWebProvider>
    </WalletProvider>
  )
}
