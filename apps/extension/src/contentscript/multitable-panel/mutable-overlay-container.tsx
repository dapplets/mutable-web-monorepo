import { AppInstanceWithSettings } from '@mweb/backend'
import { useMutableWeb, useMutationApp } from '@mweb/engine'
import { AppSwitcher, MiniOverlay } from '@mweb/shared-components'
import React from 'react'
import Background from '../../common/background'
import { NearNetworkId } from '../../common/networks'
import { useAccountId } from 'near-social-vm'

// ToDo: move to shared components?
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
}: {
  notchRef: React.RefObject<HTMLDivElement>
  networkId: NearNetworkId
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  open: boolean
  handleMutateButtonClick: () => void
}) {
  const loggedInAccountId = useAccountId()
  const { selectedMutation, mutationApps } = useMutableWeb()
  const trackingRefs = new Set<React.RefObject<HTMLDivElement>>()
  trackingRefs.add(notchRef)

  return (
    <MiniOverlay
      setOpen={setOpen}
      open={open}
      trackingRefs={trackingRefs}
      baseMutation={selectedMutation}
      mutationApps={mutationApps}
      nearNetwork={networkId}
      loggedInAccountId={loggedInAccountId}
      onConnectWallet={Background.connectWallet}
      onDisconnectWallet={Background.disconnectWallet}
      onMutateButtonClick={handleMutateButtonClick}
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
