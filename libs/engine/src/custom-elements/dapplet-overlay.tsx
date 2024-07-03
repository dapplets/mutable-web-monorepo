import * as React from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import { useViewport } from '../app/contexts/viewport-context'
import { ShadowDomWrapper } from '../app/components/shadow-dom-wrapper'

const ModalBackdrop = styled.div`
  background: #ffffff88;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  outline: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
    'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  z-index: 2147483647;
  visibility: visible;
`

export interface OverlayProps {
  children: React.ReactNode
}

export const Overlay: React.FC<OverlayProps> = ({ children }) => {
  const { viewportRef } = useViewport()

  if (!viewportRef.current) return null

  return createPortal(
    <ShadowDomWrapper className="mweb-overlay">
      <ModalBackdrop>{children}</ModalBackdrop>
    </ShadowDomWrapper>,
    viewportRef.current
  )
}

export const DappletOverlay = ({ children }: { children: React.ReactNode[] }) => {
  const child = children.filter((c) => typeof c !== 'string' || !!c.trim())[0]
  return <Overlay>{child}</Overlay>
}
