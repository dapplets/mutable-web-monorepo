import React from 'react'
import { useMutableWeb } from '@mweb/engine'
import { MiniOverlay } from '@mweb/shared-components'
import styled from 'styled-components'

const MiniOverlayContainer = styled(MiniOverlay)`
  div[data-mweb-context-type='mweb-overlay'] {
    top: 80px;
  }
`

function MutableOverlayContainer() {
  // ToDo: move to @mweb/engine
  const { selectedMutation, mutationApps } = useMutableWeb()
  return <MiniOverlayContainer baseMutation={selectedMutation} mutationApps={mutationApps} />
}

export default MutableOverlayContainer
