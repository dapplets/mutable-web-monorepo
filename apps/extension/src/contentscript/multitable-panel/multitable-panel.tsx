import { EntitySourceType } from '@mweb/backend'
import { useMutableWeb } from '@mweb/engine'
import { useApplications } from '@mweb/react-engine'
import { EngineProvider } from '@mweb/shared-components'
import React, { FC, useState } from 'react'
import styled from 'styled-components'
import { MiniOverlay } from '@mweb/shared-components'
import { useWallet } from '../../common/wallet-context'
import { useConnectWallet } from '../../common/wallet-context/use-connect-wallet'
import { useDisconnectWallet } from '../../common/wallet-context/use-disconnect-wallet'
import { useSidePanel } from '../hooks/use-side-panel'

export const MultitablePanel: FC = () => {
  useSidePanel()
  const { accountId, networkId } = useWallet()
  const { connectWallet } = useConnectWallet()
  const { disconnectWallet } = useDisconnectWallet()
  const { tree, mutations, selectedMutation, switchMutation } = useMutableWeb()
  const [isOverlayOpen, setIsOverlayOpen] = useState(false) // ToDo: move to MiniOverlay

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
        <MiniOverlay setOpen={(isOpen) => setIsOverlayOpen(isOpen)} open={isOverlayOpen} />
      </EngineProvider>
    </>
  )
}

export default MultitablePanel
