import React from 'react'
import { useMutableWeb } from '@mweb/engine'
import { MiniOverlay, EngineProvider } from '@mweb/shared-components'
import { NetworkId } from '../../data/widgets'

function MutableOverlayContainer(props) {
  const { selectedMutationId, switchMutation, tree } = useMutableWeb()

  return (
    <EngineProvider
      tree={tree}
      loggedInAccountId={props.signedAccountId}
      nearNetwork={NetworkId}
      onConnectWallet={() => props.requestSignIn()}
      onDisconnectWallet={() => props.logOut()}
      selectedMutationId={selectedMutationId}
      onSwitchMutation={switchMutation}
    >
      <MiniOverlay />
    </EngineProvider>
  )
}

export default MutableOverlayContainer
