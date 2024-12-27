import { EntitySourceType } from '@mweb/backend'
import { useMutableWeb } from '@mweb/engine'
import { EventEmitter as NEventEmitter } from 'events'
import React, { FC, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { NearNetworkId } from '../../common/networks'
import { MutationEditorModal } from './components/mutation-editor-modal'
import MutableOverlayContainer from './mutable-overlay-container'

const WrapperPanel = styled.div<{ $isAnimated?: boolean }>`
  // Global Styles
  font-family: 'Segoe UI', sans-serif;
  * {
    box-sizing: border-box;
  }
  // End Global Styles

  width: 100%;
  right: 0;
  position: fixed;
  z-index: 5000;
  top: 0;
  background: transparent;
  height: 5px;

  &::before {
    content: '';
    width: 100%;
    height: 5px;
    display: block;
    background: #384bff;
  }

  &:hover,
  &:focus {
    .visible-notch {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .visible-default {
    opacity: 1 !important;
    transform: translateY(0);
  }

  .visible-pin {
    opacity: 1 !important;
    transform: translateY(0);
  }
`

interface MultitablePanelProps {
  eventEmitter: NEventEmitter
}

export const MultitablePanel: FC<MultitablePanelProps> = ({ eventEmitter }) => {
  const { mutations, allApps, selectedMutation, config } = useMutableWeb()
  const [isOverlayOpened, setIsOverlayOpened] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const notchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const openMutationPopupCallback = () => {
      setIsModalOpen(true)
    }
    eventEmitter.on('openMutationPopup', openMutationPopupCallback)
    return () => {
      eventEmitter.off('openMutationPopup', openMutationPopupCallback)
    }
  }, [eventEmitter])

  const handleMutateButtonClick = () => {
    setIsModalOpen(true)
    setIsOverlayOpened(false)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  // The notch can be opened from the extension's context menu on websites without any mutation
  if (!isModalOpen && mutations.length === 0) return null

  return (
    <>
      <MutableOverlayContainer
        notchRef={notchRef}
        networkId={config.networkId as NearNetworkId}
        eventEmitter={eventEmitter}
        setOpen={setIsOverlayOpened}
        open={isOverlayOpened}
        handleMutateButtonClick={handleMutateButtonClick}
      />
      <WrapperPanel $isAnimated={false} data-testid="mutation-panel">
        {isModalOpen ? (
          <MutationEditorModal
            apps={allApps}
            baseMutation={selectedMutation}
            localMutations={mutations.filter((m) => m.source === EntitySourceType.Local)}
            onClose={handleModalClose}
          />
        ) : null}
      </WrapperPanel>
    </>
  )
}

export default MultitablePanel
