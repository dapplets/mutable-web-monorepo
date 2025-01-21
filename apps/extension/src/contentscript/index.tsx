import React from 'react'
import { createRoot } from 'react-dom/client'
import browser from 'webextension-polyfill'
import { Core, IContextNode } from '@mweb/core'
import Background from '../common/background'
import { WalletProvider } from '../common/wallet-context'
import { App } from './app'
import { setupMessageListener } from '../common/messenger'
import { EventEmitter as NEventEmitter } from 'events'

// ToDo: get rid of this
const ee = new NEventEmitter()

const core = new Core()

function handleChildContextAdded({ child }: { child: IContextNode }) {
  ee.emit('childContextAdded', child.toTransferable({ dir: 'up' }))

  child.on('childContextAdded', handleChildContextAdded)
  child.on('childContextRemoved', ({ child }) => {
    ee.emit('childContextRemoved', child.toTransferable({ dir: 'up' }))
  })
  child.on('contextChanged', () => {
    ee.emit('contextChanged', child.toTransferable({ dir: 'up' }))
  })
}

handleChildContextAdded({ child: core.tree })

async function main() {
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

browser.runtime.onConnect.addListener((port) => {
  if (port.name !== 'sp-to-cs') {
    port.disconnect()
    return
  }

  port.postMessage({ type: 'contextTree', data: core.tree.toTransferable({ dir: 'down' }) })

  const handleChildContextAdded = (data: IContextNode) =>
    port.postMessage({ type: 'childContextAdded', data })
  const handleChildContextRemoved = (data: IContextNode) =>
    port.postMessage({ type: 'childContextRemoved', data })
  const handleContextChanged = (data: IContextNode) =>
    port.postMessage({ type: 'contextChanged', data })

  ee.on('childContextAdded', handleChildContextAdded)
  ee.on('childContextRemoved', handleChildContextRemoved)
  ee.on('contextChanged', handleContextChanged)

  port.onDisconnect.addListener(() => {
    ee.removeListener('childContextAdded', handleChildContextAdded)
    ee.removeListener('childContextRemoved', handleChildContextRemoved)
    ee.removeListener('contextChanged', handleContextChanged)
  })
})
