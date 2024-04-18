import { EventEmitter as NEventEmitter } from 'events'
import React, { FC, useEffect, useState } from 'react'
import Draggable from 'react-draggable'
import styled from 'styled-components'
import { useMutableWeb } from '../contexts/mutable-web-context'
import { getPanelPinned, removePanelPinned, setPanelPinned } from '../storage'
import { PinOutlineIcon, PinSolidIcon } from './assets/vectors'
import { Dropdown } from './components/dropdown'
import { MutationEditorModal } from './components/mutation-editor-modal'

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
    .visible-north-panel {
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

const NorthPanelWrapper = styled.span`
  position: fixed;
  height: 5px;
`

const NorthPanel = styled.div<{ $isAnimated?: boolean }>`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: space-between;
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
  z-index: 5000;
  padding: 4px;
  padding-top: 0;
  border-radius: 0 0 6px 6px;
  background: #384bff;
  box-shadow: 0 4px 5px rgb(45 52 60 / 10%), 0 4px 20px rgb(11 87 111 / 15%);
  opacity: 0;
  transform: translateY(-100%);
  transition: ${(props) =>
    props.$isAnimated ? 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out' : 'initial'};
`

const PinWrapper = styled.div`
  width: 16px;
  height: 16px;
  cursor: pointer;

  &:hover,
  &:focus {
    opacity: 0.5;
  }
`
const DragWrapper = styled.div`
  width: 16px;
  height: 37px;
  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  border-radius: 2px;
  &:hover,
  &:focus {
    opacity: 0.5;
  }
`

const DragIconWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 8px;
  height: 8px;
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
  const { mutations, apps, selectedMutation } = useMutableWeb()
  const [isDropdownVisible, setIsDropdownVisible] = useState(false)
  const [isPin, setPin] = useState(!!getPanelPinned())
  const [isDragging, setIsDragging] = useState(false)
  const [isPanelDisplayed, setIsPanelDisplayed] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPanelDisplayed(false)
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
      removePanelPinned()
    } else {
      setPanelPinned('pin')
    }
    setPin(!isPin)
  }

  const handleMutateButtonClick = () => {
    setIsModalOpen(true)
    setIsDropdownVisible(false)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  return isModalOpen ? (
    <WrapperPanel $isAnimated={!isDragging} data-testid="mutable-panel">
      <MutationEditorModal apps={apps} baseMutation={selectedMutation} onClose={handleModalClose} />
    </WrapperPanel>
  ) : mutations.length !== 0 ? (
    <WrapperPanel $isAnimated={!isDragging} data-testid="mutable-panel">
      <Draggable
        axis="x"
        bounds="parent"
        handle=".dragWrapper"
        onStart={handleStartDrag}
        onStop={handleStopDrag}
        defaultPosition={{ x: window.innerWidth / 2 - 159, y: 0 }}
      >
        <NorthPanelWrapper>
          {/* ToDo: refactor className */}
          <NorthPanel
            data-testid="north-panel"
            className={
              isPin
                ? 'visible-pin'
                : isPanelDisplayed || isDropdownVisible || isDragging
                ? 'visible-default'
                : 'visible-north-panel'
            }
            $isAnimated={!isDragging}
          >
            <DragWrapper className="dragWrapper">
              <DragIconWrapper>
                <DragIcon />
              </DragIconWrapper>
            </DragWrapper>
            <Dropdown
              isVisible={isDropdownVisible}
              onVisibilityChange={setIsDropdownVisible}
              onMutateButtonClick={handleMutateButtonClick}
            />
            <PinWrapper onClick={handlePin}>
              {isPin ? <PinSolidIcon /> : <PinOutlineIcon />}
            </PinWrapper>
          </NorthPanel>
        </NorthPanelWrapper>
      </Draggable>
    </WrapperPanel>
  ) : null
}

export default MultitablePanel
