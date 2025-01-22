import React from 'react'
import { useMutableWeb } from '@mweb/engine'
import { MiniOverlay } from '@mweb/shared-components'
import { useAccountId } from 'near-social-vm'
import { NetworkId } from '../../data/widgets'

function MutableOverlayContainer(props) {
  const loggedInAccountId = useAccountId()
  const { selectedMutation, mutationApps } = useMutableWeb()

  const [open, setOpen] = React.useState(false)

  return (
    <MiniOverlay
      setOpen={setOpen}
      open={open}
      baseMutation={selectedMutation}
      mutationApps={mutationApps}
      nearNetwork={NetworkId}
      loggedInAccountId={loggedInAccountId}
      onConnectWallet={() => props.requestSignIn()}
      onDisconnectWallet={() => props.logOut()}
    />
  )
}

export default MutableOverlayContainer
