import { NetworkId, setupWalletSelector } from '@near-wallet-selector/core'
import { EventEmitter as NEventEmitter } from 'events'
import { customElements, MutableWebProvider, ShadowDomWrapper } from '@mweb/engine'
import { EngineConfig } from '@mweb/backend'
import { useInitNear } from 'near-social-vm'
import React, { FC, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import browser from 'webextension-polyfill'
import { NearNetworkId, networkConfigs } from '../common/networks'
import Background from '../common/background'
import { ExtensionStorage } from './extension-storage'
import { MultitablePanel } from './multitable-panel/multitable-panel'
import { setupWallet } from './wallet'

const eventEmitter = new NEventEmitter()
const networkIdPromise = Background.getCurrentNetwork()

// The wallet selector looks like an unnecessary abstraction layer over the "mutable-web-extension" wallet
// but we have to use it because near-social-vm uses not only a wallet object, but also a selector state
// object and its Observable for event subscription
const selectorPromise = networkIdPromise.then((networkId) =>
  setupWalletSelector({
    network: networkId,
    // The storage is faked because it's not necessary. The selected wallet ID is hardcoded below
    storage: new ExtensionStorage(`wallet-selector:${networkId}`),
    modules: [setupWallet({ eventEmitter })],
  }).then((selector) => {
    // Use background wallet by default
    const wallet = selector.wallet
    selector.wallet = () => wallet('mutable-web-extension')
    return selector
  })
)

const App: FC<{ networkId: NearNetworkId }> = ({ networkId }) => {
  const networkConfig = networkConfigs[networkId]

  const { initNear } = useInitNear()

  useEffect(() => {
    if (initNear) {
      initNear({
        networkId: networkConfig.networkId,
        config: {
          nodeUrl: networkConfig.nodeUrl,
        },
        selector: selectorPromise,
        features: {
          skipTxConfirmationPopup: true,
        },
        customElements,
      })
    }
  }, [initNear])

  return null
}

async function main() {
  const networkId = await networkIdPromise
  const devServerUrl = await Background.getDevServerUrl()

  // Execute useInitNear hook before start the engine
  // It's necessary for widgets from near-social-vm
  createRoot(document.createDocumentFragment()).render(<App networkId={networkId} />)

  const tabState = await Background.popTabState()
  const selector = await selectorPromise

  const bootstrapCssUrl = browser.runtime.getURL('bootstrap.min.css')

  // ToDo: move to MutableWebContext
  const engineConfig: EngineConfig = {
    networkId,
    gatewayId: 'mutable-web-extension',
    selector,
    storage: new ExtensionStorage('mutableweb'),
    bosElementStyleSrc: bootstrapCssUrl,
  }

  const mutationIdToLoad = tabState?.mutationId

  await selector.wallet()

  browser.runtime.onMessage.addListener((message) => {
    if (!message || !message.type) return
    if (message.type === 'PING') {
      // Used for background. When user clicks on the extension icon, content script may be not injected.
      // It's a way to check liveness of the content script
      return Promise.resolve('PONG')
    } else if (message.type === 'COPY') {
      navigator.clipboard.writeText(message.address)
    } else if (message.type === 'SIGNED_IN') {
      eventEmitter.emit('signedIn', message.params)
    } else if (message.type === 'SIGNED_OUT') {
      eventEmitter.emit('signedOut')
    } else if (message.type === 'OPEN_NEW_MUTATION_POPUP') {
      // ToDo: eventEmitter is intended for near-wallet-selector
      eventEmitter.emit('openMutationPopup')
    }
  })

  const container = document.createElement('div')
  container.className = 'mweb-extension'
  container.style.display = 'flex'
  document.body.appendChild(container)
  const root = createRoot(container)
  root.render(
    <MutableWebProvider
      config={engineConfig}
      defaultMutationId={mutationIdToLoad}
      devServerUrl={devServerUrl}
    >
      <ShadowDomWrapper stylesheetSrc={engineConfig.bosElementStyleSrc}>
        <MultitablePanel eventEmitter={eventEmitter} />
      </ShadowDomWrapper>
    </MutableWebProvider>
  )
}

main().catch(console.error)
