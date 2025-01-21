import React from 'react'
import { createRoot } from 'react-dom/client'
import browser from 'webextension-polyfill'
import { Core } from '@mweb/core'
import Background from '../common/background'
import { WalletProvider } from '../common/wallet-context'
import { App } from './app'
import { setupMessageListener } from '../common/messenger'

async function main() {
  const core = new Core()

  const networkId = await Background.getCurrentNetwork()
  const devServerUrl = await Background.getDevServerUrl()
  const tabState = await Background.popTabState()

  const mutationIdToLoad = tabState?.mutationId

  const container = document.createElement('div')
  container.className = 'mweb-extension'
  container.style.display = 'flex'
  document.body.appendChild(container)
  const root = createRoot(container)
  root.render(
    <WalletProvider networkId={networkId}>
      <App core={core} defaultMutationId={mutationIdToLoad} devServerUrl={devServerUrl} />
    </WalletProvider>
  )
}

main().catch(console.error)

const csFunctions = {
  isAlive: () => Promise.resolve(true),
  writeToClipboard: (text: string) => navigator.clipboard.writeText(text),
}

export type CsFunctions = typeof csFunctions

browser.runtime.onMessage.addListener(
  setupMessageListener(csFunctions, { handlerName: 'cs' }) as any
)
