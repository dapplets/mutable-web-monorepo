import { EventEmitter as NEventEmitter } from 'events'
import { useMutableWeb, useMutationApp } from '@mweb/engine'
import { AppInstanceWithSettings } from '@mweb/backend'
import { AppSwitcher, MiniOverlay } from '@mweb/shared-components'
import React, { useState } from 'react'
import Background from '../../common/background'
import { NearNetworkId } from '../../common/networks'

function AppSwitcherContainer({ app }: { app: AppInstanceWithSettings }) {
  const { enableApp, disableApp, isLoading } = useMutationApp(app.instanceId)
  return (
    <AppSwitcher app={app} enableApp={enableApp} disableApp={disableApp} isLoading={isLoading} />
  )
}

function MutableOverlayContainer({
  notchRef,
  networkId,
  setOpen,
  open,
  handleMutateButtonClick,
  eventEmitter,
}: {
  notchRef: React.RefObject<HTMLDivElement>
  networkId: NearNetworkId
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  open: boolean
  handleMutateButtonClick: () => void
  eventEmitter: NEventEmitter
}) {
  const { selectedMutation, mutationApps } = useMutableWeb()
  const trackingRefs = new Set<React.RefObject<HTMLDivElement>>()
  trackingRefs.add(notchRef)
  return (
    <MiniOverlay
      setOpen={setOpen}
      open={open}
      baseMutation={selectedMutation}
      mutationApps={mutationApps}
      nearNetwork={networkId}
      connectWallet={Background.connectWallet}
      disconnectWallet={Background.disconnectWallet}
      trackingRefs={trackingRefs}
      eventEmitter={eventEmitter}
      handleMutateButtonClick={handleMutateButtonClick}
    >
      <>
        {mutationApps.map((app) => (
          <AppSwitcherContainer key={`${app.id}/${app.instanceId}`} app={app} />
        ))}
      </>
    </MiniOverlay>
  )
}
export default MutableOverlayContainer
