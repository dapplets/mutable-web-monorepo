import { EntitySourceType } from '@mweb/backend'
import { useMutableWeb } from '@mweb/engine'
import { EventEmitter as NEventEmitter } from 'events'
import React, { FC, useEffect, useRef, useState } from 'react'
import Draggable from 'react-draggable'
import styled from 'styled-components'
import { NearNetworkId } from '../../common/networks'
import { getIsPanelUnpinned, removePanelUnpinnedFlag, setPanelUnpinnedFlag } from '../storage'
import { PinOutlineIcon, PinSolidIcon } from './assets/vectors'
import { Dropdown } from './components/dropdown'
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

const Notch = styled.div<{ $isAnimated?: boolean; $isOpen?: boolean }>`
  position: relative;
  display: flex;
  align-items: stretch;
  -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  text-rendering: auto;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: none;
  -webkit-overflow-scrolling: touch;

  width: 318px;
  height: 45px;
  border-radius: ${(props) => (props.$isOpen ? '0' : '0 0 6px 6px')};
  background: #384bff;
  box-shadow: 0 4px 5px rgb(45 52 60 / 10%), 0 4px 20px rgb(11 87 111 / 15%);
  opacity: 0;
  transform: translateY(-100%);
  transition: ${(props) =>
    props.$isAnimated ? 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out' : 'initial'};

  justify-content: space-between;
  padding: 4px 5px;
  padding-top: 0;
`

const NotchButtonWrapper = styled.div`
  width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover,
  &:focus {
    opacity: 0.5;
  }
`

const IconWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
`

const DragIcon = () => (
  <svg width="8" height="10" viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect y="0.75" width="8" height="1.5" rx="0.75" fill="white" />
    <rect y="4.25" width="8" height="1.5" rx="0.75" fill="white" />
    <rect y="7.75" width="8" height="1.5" rx="0.75" fill="white" />
  </svg>
)

interface MultitablePanelProps {
  eventEmitter: NEventEmitter
}

export const MultitablePanel: FC<MultitablePanelProps> = ({ eventEmitter }) => {
  const { mutations, allApps, selectedMutation, config } = useMutableWeb()
  const [isOverlayOpened, setIsOverlayOpened] = useState(false)
  const [isPin, setPin] = useState(!getIsPanelUnpinned())
  const [isDragging, setIsDragging] = useState(false)
  const [isNotchDisplayed, setIsNotchDisplayed] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const notchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNotchDisplayed(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [isPin])

  useEffect(() => {
    const openMutationPopupCallback = () => {
      setIsModalOpen(true)
    }
    eventEmitter.on('openMutationPopup', openMutationPopupCallback)
    return () => {
      eventEmitter.off('openMutationPopup', openMutationPopupCallback)
    }
  }, [eventEmitter])

  const handleStartDrag = () => {
    setIsDragging(true)
  }

  const handleStopDrag = () => {
    setIsDragging(false)
  }

  const handlePin = () => {
    if (isPin) {
      setPanelUnpinnedFlag('unpin')
    } else {
      removePanelUnpinnedFlag()
    }
    setPin(!isPin)
  }

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
        setOpen={setIsOverlayOpened}
        open={isOverlayOpened}
        handleMutateButtonClick={handleMutateButtonClick}
      />
      <WrapperPanel $isAnimated={!isDragging} data-testid="mutation-panel">
        {isModalOpen ? (
          <MutationEditorModal
            apps={allApps}
            baseMutation={selectedMutation}
            localMutations={mutations.filter((m) => m.source === EntitySourceType.Local)}
            onClose={handleModalClose}
          />
        ) : (
          <Draggable
            axis="x"
            bounds="parent"
            handle=".dragWrapper"
            nodeRef={notchRef}
            onStart={handleStartDrag}
            onStop={handleStopDrag}
            defaultPosition={{ x: window.innerWidth / 2 - 159, y: 0 }}
          >
            <Notch
              data-testid="notch"
              data-mweb-context-type="notch"
              data-mweb-context-parsed={JSON.stringify({ id: 'notch' })}
              data-mweb-context-level="system"
              className={
                isPin
                  ? 'visible-pin'
                  : isNotchDisplayed || isOverlayOpened || isDragging
                  ? 'visible-default'
                  : 'visible-notch'
              }
              $isAnimated={!isDragging}
              $isOpen={isOverlayOpened}
              ref={notchRef}
            >
              <NotchButtonWrapper className="dragWrapper">
                <IconWrapper>
                  <DragIcon />
                </IconWrapper>
              </NotchButtonWrapper>
              <Dropdown
                isVisible={isOverlayOpened}
                onVisibilityChange={setIsOverlayOpened}
                onMutateButtonClick={handleMutateButtonClick}
              />
              <NotchButtonWrapper onClick={handlePin}>
                <IconWrapper>{isPin ? <PinSolidIcon /> : <PinOutlineIcon />}</IconWrapper>
              </NotchButtonWrapper>
            </Notch>
          </Draggable>
        )}
      </WrapperPanel>
    </>
  )
}

export default MultitablePanel
