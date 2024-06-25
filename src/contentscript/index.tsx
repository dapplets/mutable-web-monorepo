import { NetworkId, setupWalletSelector } from '@near-wallet-selector/core'
import { EventEmitter as NEventEmitter } from 'events'
import { App as MWebApp, customElements, EngineConfig } from 'mutable-web-engine'
import { useInitNear } from 'near-social-vm'
import React, { FC, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import browser from 'webextension-polyfill'
import { networkConfig } from '../common/networks'
import Background from './background'
import { ExtensionStorage } from './extension-storage'
import { ShadowDomWrapper } from './multitable-panel/components/shadow-dom-wrapper'
import { MultitablePanel } from './multitable-panel/multitable-panel'
import { setupWallet } from './wallet'

const eventEmitter = new NEventEmitter()

// The wallet selector looks like an unnecessary abstraction layer over the background wallet
// but we have to use it because near-social-vm uses not only a wallet object, but also a selector state
// object and its Observable for event subscription
const selectorPromise = setupWalletSelector({
  network: networkConfig.networkId as NetworkId,
  // The storage is faked because it's not necessary. The selected wallet ID is hardcoded below
  storage: new ExtensionStorage('wallet-selector'),
  modules: [setupWallet({ eventEmitter })],
}).then((selector) => {
  // Use background wallet by default
  const wallet = selector.wallet
  selector.wallet = () => wallet('background')
  return selector
})

const App: FC = () => {
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
  // Execute useInitNear hook before start the engine
  // It's necessary for widgets from near-social-vm
  createRoot(document.createElement('div')).render(<App />)

  const tabState = await Background.popTabState()
  const selector = await selectorPromise

  const bootstrapCssUrl = browser.runtime.getURL('bootstrap.min.css')

  // ToDo: move to MutableWebContext
  const engineConfig: EngineConfig = {
    networkId: networkConfig.networkId,
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

  const outer = document.createElement('div')
  outer.style.display = 'flex'
  const stylesMountPoint = document.createElement('div')
  outer.appendChild(stylesMountPoint)
  const inner = document.createElement('div')
  inner.style.display = 'flex'
  outer.appendChild(inner)
  document.body.appendChild(outer)
  const root = createRoot(inner)
  root.render(
    <MWebApp
      config={engineConfig}
      stylesMountPoint={stylesMountPoint}
      defaultMutationId={mutationIdToLoad}
    >
      <ShadowDomWrapper stylesheetSrc={bootstrapCssUrl}>
        <MultitablePanel eventEmitter={eventEmitter} />
      </ShadowDomWrapper>
    </MWebApp>
  )
}

main().catch(console.error)
