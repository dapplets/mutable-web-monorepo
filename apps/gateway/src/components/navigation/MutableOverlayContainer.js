import React from 'react'
import { useMutableWeb, useMutationApp } from '@mweb/engine'
import { MiniOverlay, AppSwitcher } from '@mweb/shared-components'
import styled from 'styled-components'

const MiniOverlayContainer = styled(MiniOverlay)`
  div[data-mweb-context-type="mweb-overlay"] {
    top: 80px;
  }
`

function AppSwitcherContainer({ app }) {
  // ToDo: move to @mweb/engine
  const { enableApp, disableApp, isLoading } = useMutationApp(app.instanceId)
  return (
    <AppSwitcher app={app} enableApp={enableApp} disableApp={disableApp} isLoading={isLoading} />
  )
}

function MutableOverlayContainer() {
  // ToDo: move to @mweb/engine
  const { selectedMutation, mutationApps } = useMutableWeb()
  return (
    <MiniOverlayContainer baseMutation={selectedMutation} mutationApps={mutationApps}>
      {mutationApps.map((app) => (
        <AppSwitcherContainer key={app.id} app={app} />
      ))}
    </MiniOverlayContainer>
  )
}

export default MutableOverlayContainer
