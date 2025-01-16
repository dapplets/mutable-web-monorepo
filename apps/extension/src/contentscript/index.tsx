import React from 'react'
import { createRoot } from 'react-dom/client'
import browser from 'webextension-polyfill'
import Background from '../common/background'
import { WalletProvider } from '../common/wallet-context'
import { App } from './app'

async function main() {
  const networkId = await Background.getCurrentNetwork()
  const devServerUrl = await Background.getDevServerUrl()
  const tabState = await Background.popTabState()

  const mutationIdToLoad = tabState?.mutationId

  browser.runtime.onMessage.addListener((message: any) => {
    if (!message || !message.type) return
    if (message.type === 'PING') {
      // Used for background. When user clicks on the extension icon, content script may be not injected.
      // It's a way to check liveness of the content script
      return Promise.resolve('PONG')
    } else if (message.type === 'COPY') {
      navigator.clipboard.writeText(message.address)
    } else if (message.type === 'OPEN_NEW_MUTATION_POPUP') {
      // ToDo: eventEmitter is intended for near-wallet-selector
      // eventEmitter.emit('openMutationPopup')
    }
  })

  const container = document.createElement('div')
  container.className = 'mweb-extension'
  container.style.display = 'flex'
  document.body.appendChild(container)
  const root = createRoot(container)
  root.render(
    <WalletProvider networkId={networkId}>
      <App defaultMutationId={mutationIdToLoad} devServerUrl={devServerUrl} />
    </WalletProvider>
  )
}

main().catch(console.error)
