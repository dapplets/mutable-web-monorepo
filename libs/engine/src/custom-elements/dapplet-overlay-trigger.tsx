import * as React from 'react'
import { useRef, forwardRef, cloneElement } from 'react'
import { OverlayTrigger as RbOverlayTrigger } from 'react-bootstrap'
import { StyleSheetManager } from 'styled-components'
import { useViewport } from '../app/contexts/viewport-context'

const Overlay: React.FC<{ overlay: React.ReactElement }> = forwardRef(
  ({ overlay, ...otherProps }, ref) => {
    const stylesRef = useRef<HTMLDivElement | null>(null)

    return (
      <div ref={stylesRef} className="mweb-overlay-trigger">
        {stylesRef.current ? (
          <StyleSheetManager target={stylesRef.current}>
            {cloneElement(overlay, { ...otherProps, ref })}
          </StyleSheetManager>
        ) : null}
      </div>
    )
  }
)

export const _DappletOverlayTrigger = ({ children, ...attributes }: any) => {
  const { viewportRef } = useViewport()

  if (!viewportRef.current) return null

  return (
    <RbOverlayTrigger
      {...attributes}
      container={viewportRef.current}
      overlay={<Overlay overlay={attributes.overlay} />}
    >
      {children}
    </RbOverlayTrigger>
  )
}

// ToDo: remove any
export const DappletOverlayTrigger = ({ children, ...attributes }: any) => {
  const child = children.filter((c: any) => typeof c !== 'string' || !!c.trim())[0]
  return <_DappletOverlayTrigger {...attributes}>{child}</_DappletOverlayTrigger>
}
