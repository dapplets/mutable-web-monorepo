import React from 'react'
import { createContext } from 'react'

export type ModalContextState = {
  modalContainerRef: React.RefObject<HTMLDivElement>
}

export const contextDefaultValues: ModalContextState = {
  modalContainerRef: React.createRef<HTMLDivElement>(),
}

export const ModalContext = createContext<ModalContextState>(contextDefaultValues)
