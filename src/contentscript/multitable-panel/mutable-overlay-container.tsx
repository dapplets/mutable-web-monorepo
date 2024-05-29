import { AppSwitcher, AppWithSettings, MiniOverlay } from 'mutable-web-engine'
import React from 'react'
import Background from '../background'
import { useMutableWeb, useMutationApp } from '../contexts/mutable-web-context'

function AppSwitcherContainer({ app }: { app: AppWithSettings }) {
  const { enableApp, disableApp, isLoading } = useMutationApp(app.id)
  return (
    <AppSwitcher app={app} enableApp={enableApp} disableApp={disableApp} isLoading={isLoading} />
  )
}

function MutableOverlayContainer() {
  const { selectedMutation, mutationApps } = useMutableWeb()
  return (
    <MiniOverlay
      baseMutation={selectedMutation}
      mutationApps={mutationApps}
      nearNetwork={NEAR_NETWORK}
      connectWallet={Background.connectWallet}
      disconnectWallet={Background.disconnectWallet}
    >
      <>
        {mutationApps.map((app) => (
          <AppSwitcherContainer key={app.id} app={app} />
        ))}
      </>
    </MiniOverlay>
  )
}
export default MutableOverlayContainer
