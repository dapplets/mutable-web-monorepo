import { EngineConfig } from '@mweb/backend'
import { Core } from '@mweb/core'
import { customElements, MutableWebProvider, ShadowDomWrapper } from '@mweb/engine'
import { useInitNear } from 'near-social-vm'
import React, { FC, useEffect } from 'react'
import browser from 'webextension-polyfill'
import { ExtensionStorage } from '../common/extension-storage'
import { networkConfigs } from '../common/networks'
import { useWallet } from '../common/wallet-context'
import { MultitablePanel } from './multitable-panel/multitable-panel'

export const App: FC<{
  defaultMutationId?: string | null
  devServerUrl?: string | null
}> = ({ defaultMutationId, devServerUrl }) => {
  const { selector, networkId } = useWallet()

  const { initNear } = useInitNear()

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
  }

  return (
    <MutableWebProvider
      config={engineConfig}
      defaultMutationId={defaultMutationId}
      devServerUrl={devServerUrl}
    >
      <ShadowDomWrapper stylesheetSrc={engineConfig.bosElementStyleSrc}>
        <MultitablePanel />
      </ShadowDomWrapper>
    </MutableWebProvider>
  )
}
