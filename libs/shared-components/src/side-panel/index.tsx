import React from 'react'
import { FC } from 'react'
import { SidePanel as SidePanelInternal } from '../mini-overlay/side-panel'
import { MemoryRouter } from 'react-router'

export interface ISidePanelProps {
  onMutateButtonClick: () => void
}

export const SidePanel: FC<ISidePanelProps> = ({ onMutateButtonClick }) => {
  return (
    <MemoryRouter>
      <SidePanelInternal onMutateButtonClick={onMutateButtonClick} />
    </MemoryRouter>
  )
}
