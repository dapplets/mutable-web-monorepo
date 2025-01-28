import * as React from 'react'
import { createRoot } from 'react-dom/client'
import browser from 'webextension-polyfill'
import { WalletProvider } from '../common/wallet-context'
import { App } from './app'
import './index.css'
import { setupMessageListener } from '../common/messenger'

async function main() {
  const container = document.getElementById('app')

  if (container) {
    createRoot(container).render(
      <WalletProvider>
        <App />
      </WalletProvider>
    )
  } else {
    console.error('Container not found')
  }
}

main().catch(console.error)

const spFunctions = {
  isAlive: () => Promise.resolve(true),
  close: () => Promise.resolve(window.close()),
}

export type SpFunctions = typeof spFunctions

browser.runtime.onMessage.addListener(
  setupMessageListener(spFunctions, { handlerName: 'sp' }) as any
)
