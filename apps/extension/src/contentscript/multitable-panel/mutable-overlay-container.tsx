import React from 'react'
import { useMutableWeb } from '@mweb/engine'
import { MiniOverlay } from '@mweb/shared-components'
import { useAccountId } from 'near-social-vm'
import Background from '../../common/background'
import { NearNetworkId } from '../../common/networks'

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
    />
  )
}
export default MutableOverlayContainer
