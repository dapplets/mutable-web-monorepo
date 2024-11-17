import { EventEmitter as NEventEmitter } from 'events'
import { useMutableWeb } from '@mweb/engine'
import React, { FC, useEffect, useRef, useState } from 'react'
import MutableOverlayContainer from './mutable-overlay-container'
import { NearNetworkId } from '../../common/networks'

interface MultitablePanelProps {
  eventEmitter: NEventEmitter
}

export const MultitablePanel: FC<MultitablePanelProps> = ({ eventEmitter }) => {
  const { mutations, config } = useMutableWeb()

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

  // The notch can be opened from the extension's context menu on websites without any mutation
  if (!isModalOpen && mutations.length === 0) return null

  return (
    <>
      <MutableOverlayContainer notchRef={notchRef} networkId={config.networkId as NearNetworkId} />
    </>
  )
}

export default MultitablePanel
