import { useMutableWeb } from '@mweb/engine'
import { EngineProvider, MiniOverlay } from '@mweb/shared-components'
import React, { FC } from 'react'
import { useConnectWallet, useDisconnectWallet, useWallet } from '../../common/wallet-context'
import { useSidePanel } from '../hooks/use-side-panel'

export const MultitablePanel: FC = () => {
  useSidePanel()
  const { accountId, networkId } = useWallet()
  const { connectWallet } = useConnectWallet()
  const { disconnectWallet } = useDisconnectWallet()
  const { tree, mutations, selectedMutation, switchMutation } = useMutableWeb()

  // The notch can be opened from the extension's context menu on websites without any mutation
  if (mutations.length === 0) return null

  return (
    <>
      <EngineProvider
        tree={tree}
        loggedInAccountId={accountId}
        nearNetwork={networkId}
        onConnectWallet={connectWallet}
        onDisconnectWallet={disconnectWallet}
        selectedMutationId={selectedMutation?.id ?? null}
        onSwitchMutation={switchMutation}
      >
        <MiniOverlay />
      </EngineProvider>
    </>
  )
}

export default MultitablePanel
