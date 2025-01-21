import * as React from 'react'
import { createRoot } from 'react-dom/client'
import Background from '../common/background'
import { WalletProvider } from '../common/wallet-context'
import { App } from './app'
import './index.css'

async function main() {
  const networkId = await Background.getCurrentNetwork()

  // ToDo: handle another events

  const container = document.getElementById('app')

  if (container) {
    createRoot(container).render(
      <WalletProvider networkId={networkId}>
        <App />
      </WalletProvider>
    )
  } else {
    console.error('Container not found')
  }
}

main().catch(console.error)
