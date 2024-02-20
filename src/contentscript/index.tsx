import { setupWalletSelector } from '@near-wallet-selector/core'
import { DappletOverlay, Engine } from 'mutable-web-engine'
import { useInitNear } from 'near-social-vm'
import React, { FC, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import browser from 'webextension-polyfill'
import { ExtensionStorage } from './extension-storage'
import { MultitablePanel } from './multitable-panel/multitable-panel'
import { setupWallet } from './wallet'

const NETWORK_ID = 'mainnet'

// The wallet selector looks like an unnecessary abstraction layer over the background wallet
// but we have to use it because near-social-vm uses not only a wallet object, but also a selector state
// object and its Observable for event subscription
const selectorPromise = setupWalletSelector({
  network: NETWORK_ID,
  // The storage is faked because it's not necessary. The selected wallet ID is hardcoded below
  storage: new ExtensionStorage(),
  modules: [setupWallet()],
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
        networkId: NETWORK_ID,
        selector: selectorPromise,
        features: {
          skipTxConfirmationPopup: true,
        },
        customElements: { DappletOverlay },
      })
    }
  }, [initNear])

  return null
}

async function main() {
  // Execute useInitNear hook before start the engine
  // It's necessary for widgets from near-social-vm
  createRoot(document.createElement('div')).render(<App />)

  const selector = await selectorPromise

  const engine = new Engine({
    networkId: NETWORK_ID,
    selector,
  })
  await engine.start()

  browser.runtime.onMessage.addListener((message) => {
    if (!message || !message.type) return
    if (message.type === 'PING')
      // Used for background. When user clicks on the extension icon, content script may be not injected.
      // It's a way to check liveness of the content script
      return Promise.resolve('PONG')
    if (message.type === 'RESTART') {
      engine.stop()
      engine.start()
    } else if (message.type === 'COPY') {
      const type = 'text/plain'
      const blob = new Blob([message.address], { type })
      const data = [new ClipboardItem({ [type]: blob })]
      navigator.clipboard.write(data)
    }
  })

  const container = document.createElement('div')
  container.style.display = 'flex'
  document.body.appendChild(container)
  const root = createRoot(container)
  root.render(<MultitablePanel engine={engine} />)
}

main().catch(console.error)
