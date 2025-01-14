import React from 'react'
import { FC } from 'react'
import { NotificationProvider, useMutableWeb } from '@mweb/engine'
import { SidePanel as SidePanelInternal } from '../mini-overlay/side-panel'
import { MemoryRouter } from 'react-router'

export interface ISidePanelProps {
  loggedInAccountId: string | null
  nearNetwork: string
  trackingRefs?: Set<React.RefObject<HTMLDivElement>>
  overlayRef: React.RefObject<HTMLDivElement>
  onCloseOverlay: () => void
  onMutateButtonClick: () => void
  onConnectWallet: () => Promise<void>
  onDisconnectWallet: () => Promise<void>
}

export const SidePanel: FC<ISidePanelProps> = ({
  loggedInAccountId,
  nearNetwork,
  trackingRefs,
  overlayRef,
  onMutateButtonClick,
  onCloseOverlay,
  onConnectWallet,
  onDisconnectWallet,
}) => {
  const { engine } = useMutableWeb()

  return (
    <MemoryRouter>
      <NotificationProvider engine={engine} recipientId={loggedInAccountId}>
        <SidePanelInternal
          loggedInAccountId={loggedInAccountId}
          nearNetwork={nearNetwork}
          trackingRefs={trackingRefs}
          overlayRef={overlayRef}
          onCloseOverlay={onCloseOverlay}
          onMutateButtonClick={onMutateButtonClick}
          onConnectWallet={onConnectWallet}
          onDisconnectWallet={onDisconnectWallet}
        />
      </NotificationProvider>
    </MemoryRouter>
  )
}
