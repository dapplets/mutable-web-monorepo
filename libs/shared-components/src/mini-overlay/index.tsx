import { Drawer } from 'antd'
import React, { FC, useRef } from 'react'
import { MemoryRouter } from 'react-router'
import styled from 'styled-components'
import OverlayWrapper from './overlay-wrapper'
import { SidePanel } from './side-panel'
import UberSausage from './uber-sausage'
import { useEngine } from '../contexts/engine-context'
import { useMutationApps, useMutationWithSettings } from '@mweb/react-engine'

const WrapperDriver = styled.div<{ $isOpen: boolean }>`
  display: block;
  position: relative;
  border: none;
  z-index: 5000;

  .sideWrapper {
    box-shadow: none;
    width: min-content !important;
    top: 10px;
    transition: all 0.2s ease-in-out;
    transform: ${(props) => (props.$isOpen ? 'translateX(-360px)' : 'translateX(0)')};

    .ant-drawer-header-close-only {
      display: none;
    }
  }

  .sideContent {
    position: relative;
    overflow: visible;
    padding: 0;

    .ant-drawer-body {
      overflow: visible;
      padding: 0;
      width: 58px;
      direction: rtl;
    }
  }
`

interface IMiniOverlayProps {
  setOpen: (open: boolean) => void
  open: boolean
}

export const MiniOverlay: FC<IMiniOverlayProps> = ({ setOpen, open }) => {
  const { selectedMutationId } = useEngine()
  const { selectedMutation } = useMutationWithSettings(selectedMutationId)
  const { mutationApps } = useMutationApps(selectedMutation)

  // ToDo: check type
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleCloseOverlay = () => {
    setOpen(false)
  }

  return (
    <MemoryRouter>
      <WrapperDriver $isOpen={open} ref={overlayRef}>
        <Drawer
          classNames={{
            wrapper: 'sideWrapper',
            content: 'sideContent',
          }}
          open
          style={{ boxShadow: 'none', background: 'none', border: 'none', outline: 'none' }}
          mask={false}
          rootStyle={{ boxShadow: 'none', background: 'none', border: 'none', outline: 'none' }}
          getContainer={() => {
            if (!overlayRef.current) return
            return overlayRef.current as any
          }}
        >
          <UberSausage
            baseMutation={selectedMutation}
            mutationApps={mutationApps}
            isOverlayOpened={open}
            openOverlay={setOpen}
          />
        </Drawer>

        <OverlayWrapper apps={mutationApps.length > 0} onClose={handleCloseOverlay} open={open}>
          <SidePanel />
        </OverlayWrapper>
      </WrapperDriver>
    </MemoryRouter>
  )
}
