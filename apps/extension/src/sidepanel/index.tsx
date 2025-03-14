import * as React from 'react'
import { createRoot } from 'react-dom/client'
import browser from 'webextension-polyfill'
import { WalletProvider } from '../common/wallet-context'
import { WalletProvider as WalletEthProvider } from '../common/wallet-ethereum'
import { App } from './app'
import './index.css'
import { setupMessageListener } from '../common/messenger'

async function main() {
  const window = await browser.windows.getCurrent()

  if (!window.id) throw new Error('Window ID is not defined')

  const container = document.getElementById('app')

  if (container) {
    createRoot(container).render(
      <WalletProvider>
        <WalletEthProvider>
          <App windowId={window.id} />
        </WalletEthProvider>
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
