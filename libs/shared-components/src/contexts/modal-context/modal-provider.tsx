import React, { FC, ReactNode } from 'react'
import { ModalContext, ModalContextState } from './modal-context'

type Props = {
  children?: ReactNode
}

const ModalProvider: FC<Props> = ({ children }) => {
  const modalContainerRef = React.useRef<HTMLDivElement>(null)

  const state: ModalContextState = {
    modalContainerRef,
  }

  return (
    <ModalContext.Provider value={state}>
      <div ref={modalContainerRef}>{children}</div>
    </ModalContext.Provider>
  )
}

export { ModalProvider }
