import React from 'react'
import { useMutableWeb, useMutationApp } from '@mweb/engine'
import { MiniOverlay, AppSwitcher } from '@mweb/shared-components'

function AppSwitcherContainer({ app }) {
  // ToDo: move to @mweb/engine
  const { enableApp, disableApp, isLoading } = useMutationApp(app.id)
  return (
    <AppSwitcher app={app} enableApp={enableApp} disableApp={disableApp} isLoading={isLoading} />
  )
}

function MutableOverlayContainer() {
  // ToDo: move to @mweb/engine
  const { selectedMutation, mutationApps } = useMutableWeb()
  return (
    <MiniOverlay baseMutation={selectedMutation} mutationApps={mutationApps}>
      {mutationApps.map((app) => (
        <AppSwitcherContainer key={app.id} app={app} />
      ))}
    </MiniOverlay>
  )
}

export default MutableOverlayContainer
