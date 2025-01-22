import React from 'react'
import { FC } from 'react'
import { SidePanel as SidePanelInternal } from '../mini-overlay/side-panel'
import { MemoryRouter } from 'react-router'

export interface ISidePanelProps {}

export const SidePanel: FC<ISidePanelProps> = ({}) => {
  return (
    <MemoryRouter>
      <SidePanelInternal />
    </MemoryRouter>
  )
}
