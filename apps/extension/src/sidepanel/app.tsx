import React from 'react'
import browser from 'webextension-polyfill'
import { SidePanel } from '@mweb/shared-components'
import { EngineProvider } from '@mweb/react-engine'
import { Engine, EngineConfig } from '@mweb/backend'
import { ExtensionStorage } from '../common/extension-storage'
import { useWallet } from '../common/wallet-context'
import { useConnectWallet } from '../common/wallet-context/use-connect-wallet'
import { useDisconnectWallet } from '../common/wallet-context/use-disconnect-wallet'

export const App: React.FC = () => {
  const ref = React.useRef<HTMLDivElement>(null)

  const bootstrapCssUrl = browser.runtime.getURL('bootstrap.min.css')

  const { selector, networkId, accountId } = useWallet()
  const { connectWallet } = useConnectWallet()
  const { disconnectWallet } = useDisconnectWallet()

  if (!selector) return null

  // ToDo: move to MutableWebContext
  const engineConfig: EngineConfig = {
    networkId,
    gatewayId: 'mutable-web-extension',
    selector,
    storage: new ExtensionStorage(`mweb:${networkId}`),
    bosElementStyleSrc: bootstrapCssUrl,
  }

  const engine = new Engine(engineConfig)

  return (
    <EngineProvider engine={engine}>
      <SidePanel
        nearNetwork={networkId}
        loggedInAccountId={accountId}
        onConnectWallet={connectWallet}
        onDisconnectWallet={disconnectWallet}
        onMutateButtonClick={() => {}} // ToDo: implement
        onCloseOverlay={() => {}} // ToDo: implement
        trackingRefs={new Set()} // ToDo: implement
        overlayRef={ref} // ToDo: implement
      />
    </EngineProvider>
  )
}
