import { Engine, EngineConfig } from '@mweb/backend'
import { useMutableWeb } from '@mweb/engine'
import { EngineProvider as MWebProvider } from '@mweb/react-engine'
import { EngineProvider, SidePanel } from '@mweb/shared-components'
import React from 'react'
import browser from 'webextension-polyfill'
import { ExtensionStorage } from '../common/extension-storage'
import { useWallet } from '../common/wallet-context'
import { useConnectWallet } from '../common/wallet-context/use-connect-wallet'
import { useDisconnectWallet } from '../common/wallet-context/use-disconnect-wallet'

export const App: React.FC = () => {
  const bootstrapCssUrl = browser.runtime.getURL('bootstrap.min.css')

  const {} = useMutableWeb()
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
    <MWebProvider engine={engine}>
      <EngineProvider
        tree={null}
        loggedInAccountId={accountId}
        nearNetwork={networkId}
        onConnectWallet={connectWallet}
        onDisconnectWallet={disconnectWallet}
        selectedMutation={null} // todo: implement
        favoriteMutationId={null} // todo: implement
        onSetFavoriteMutation={() => {}} // todo: implement
        onSwitchMutation={() => {}} // todo: implement
        onGetPreferredSource={() => null} // todo: implement
      >
        <SidePanel
          onMutateButtonClick={() => console.log('mutate button click')} // ToDo: implement
        />
      </EngineProvider>
    </MWebProvider>
  )
}
