import React from 'react'
import browser from 'webextension-polyfill'
import { Engine, EngineConfig } from '@mweb/backend'
import { EngineProvider as MWebProvider } from '@mweb/react-engine'
import { EngineProvider, SidePanel } from '@mweb/shared-components'
import { ExtensionStorage } from '../common/extension-storage'
import { useWallet } from '../common/wallet-context'
import { useConnectWallet } from '../common/wallet-context/use-connect-wallet'
import { useDisconnectWallet } from '../common/wallet-context/use-disconnect-wallet'
import { useCurrentTab } from './use-current-tab'
import {
  useWallet as useEthWallet,
  useConnectEthWallet,
  useDisconnectEthWallet,
} from '../common/wallet-ethereum'

export const App: React.FC<{ windowId: number }> = ({ windowId }) => {
  const bootstrapCssUrl = browser.runtime.getURL('bootstrap.min.css')

  const { tree, eventEmitter } = useCurrentTab(windowId)
  const { selector, networkId, accountId } = useWallet()
  const { connectWallet } = useConnectWallet()
  const { disconnectWallet } = useDisconnectWallet()
  const { address, addresses, walletChainName } = useEthWallet()
  const { connectWallet: connectEthWallet } = useConnectEthWallet()
  const { disconnectWallet: disconnectEthWallet } = useDisconnectEthWallet()

  if (!selector) return null

  if (!tree) {
    return <div>No connection to the tab</div>
  }

  // ToDo: move to MutableWebContext
  const engineConfig: EngineConfig = {
    networkId,
    gatewayId: 'mutable-web-extension',
    selector,
    storage: new ExtensionStorage(`mweb:${networkId}`),
    bosElementStyleSrc: bootstrapCssUrl,
    eventEmitter: eventEmitter ? eventEmitter : undefined,
  }

  const engine = new Engine(engineConfig)

  return (
    <MWebProvider engine={engine}>
      <EngineProvider
        tree={tree}
        loggedInAccountId={accountId}
        nearNetwork={networkId}
        onConnectWallet={connectWallet}
        onDisconnectWallet={disconnectWallet}
        onConnectEthWallet={connectEthWallet}
        onDisconnectEthWallet={disconnectEthWallet}
        address={address}
        addresses={addresses}
        walletChainName={walletChainName}
      >
        <SidePanel />
      </EngineProvider>
    </MWebProvider>
  )
}
