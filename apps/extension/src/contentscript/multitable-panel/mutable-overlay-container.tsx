import { useMutableWeb, useMutationApp } from '@mweb/engine'
import { AppInstanceWithSettings } from '@mweb/backend'
import { AppSwitcher, MiniOverlay } from '@mweb/shared-components'
import React from 'react'
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
}: {
  notchRef: React.RefObject<HTMLDivElement>
  networkId: NearNetworkId
}) {
  const { selectedMutation, mutationApps } = useMutableWeb()
  const trackingRefs = new Set<React.RefObject<HTMLDivElement>>()
  trackingRefs.add(notchRef)
  return (
    <MiniOverlay
      baseMutation={selectedMutation}
      mutationApps={mutationApps}
      nearNetwork={networkId}
      connectWallet={Background.connectWallet}
      disconnectWallet={Background.disconnectWallet}
      trackingRefs={trackingRefs}
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
