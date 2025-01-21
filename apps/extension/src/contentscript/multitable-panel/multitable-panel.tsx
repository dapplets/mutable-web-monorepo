import { EntitySourceType } from '@mweb/backend'
import { useMutableWeb } from '@mweb/engine'
import { useApplications } from '@mweb/react-engine'
import { EngineProvider } from '@mweb/shared-components'
import React, { FC, useState } from 'react'
import styled from 'styled-components'
import { MutationEditorModal } from './components/mutation-editor-modal'
import { MiniOverlay } from '@mweb/shared-components'
import { useWallet } from '../../common/wallet-context'
import { useConnectWallet } from '../../common/wallet-context/use-connect-wallet'
import { useDisconnectWallet } from '../../common/wallet-context/use-disconnect-wallet'
import { useSidePanel } from '../hooks/use-side-panel'

const WrapperPanel = styled.div<{ $isAnimated?: boolean }>`
  // Global Styles
  font-family: 'Segoe UI', sans-serif;
  * {
    box-sizing: border-box;
  }
  // End Global Styles

  width: 100%;
  right: 0;
  position: fixed;
  z-index: 5000;
  top: 0;
  background: transparent;
  height: 5px;

  &::before {
    content: '';
    width: 100%;
    height: 5px;
    display: block;
    background: #384bff;
  }

  &:hover,
  &:focus {
    .visible-notch {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .visible-default {
    opacity: 1 !important;
    transform: translateY(0);
  }

  .visible-pin {
    opacity: 1 !important;
    transform: translateY(0);
  }
`

export const MultitablePanel: FC = () => {
  useSidePanel()
  const { accountId, networkId } = useWallet()
  const { connectWallet } = useConnectWallet()
  const { disconnectWallet } = useDisconnectWallet()
  const { tree, mutations, selectedMutation, switchMutation } = useMutableWeb()
  const { applications: allApps } = useApplications()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)

  const handleMutateButtonClick = () => {
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  // The notch can be opened from the extension's context menu on websites without any mutation
  if (!isModalOpen && mutations.length === 0) return null

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
        <MiniOverlay
          setOpen={(isOpen) => setIsOverlayOpen(isOpen)}
          open={isOverlayOpen}
          onMutateButtonClick={handleMutateButtonClick}
        />
      </EngineProvider>
      <WrapperPanel data-testid="mutation-panel">
        {isModalOpen ? (
          <MutationEditorModal
            apps={allApps}
            baseMutation={selectedMutation}
            localMutations={mutations.filter((m) => m.source === EntitySourceType.Local)}
            onClose={handleModalClose}
          />
        ) : null}
      </WrapperPanel>
    </>
  )
}

export default MultitablePanel
