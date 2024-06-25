import * as React from 'react'
import { useRef, forwardRef, cloneElement } from 'react'
import { OverlayTrigger as RbOverlayTrigger } from 'react-bootstrap'
import { StyleSheetManager } from 'styled-components'
import { useViewport } from '../app/contexts/viewport-context'

export const _DappletOverlayTrigger = ({ children, ...attributes }: any) => {
  const { viewportRef } = useViewport()

  if (!viewportRef.current) return null

  const Overlay = React.useCallback(
    forwardRef((props, ref) => {
      const stylesRef = useRef<HTMLDivElement | null>(null)

      return (
        <div ref={stylesRef}>
          {stylesRef.current ? (
            <StyleSheetManager target={stylesRef.current}>
              {cloneElement(attributes.overlay, { ...props, ref })}
            </StyleSheetManager>
          ) : null}
        </div>
      )
    }),
    [attributes.overlay]
  )

  return (
    <RbOverlayTrigger {...attributes} container={viewportRef.current} overlay={<Overlay />}>
      {children}
    </RbOverlayTrigger>
  )
}

// ToDo: remove any
export const DappletOverlayTrigger = ({ children, ...attributes }: any) => {
  const child = children.filter((c: any) => typeof c !== 'string' || !!c.trim())[0]
  return <_DappletOverlayTrigger {...attributes}>{child}</_DappletOverlayTrigger>
}
