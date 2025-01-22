import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { WalletProvider } from '../common/wallet-context'
import { App } from './app'
import './index.css'

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
