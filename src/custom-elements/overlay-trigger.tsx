import * as React from 'react'
import { useRef, forwardRef, cloneElement } from 'react'
import { OverlayTrigger as RbOverlayTrigger } from 'react-bootstrap'
import { getViewport } from '../common'
import { StyleSheetManager } from 'styled-components'

// ToDo: remove any
export const OverlayTrigger = ({ children, ...attributes }: any) => {
  const child = children.filter((c: any) => typeof c !== 'string' || !!c.trim())[0]
  const viewport = getViewport()

  if (!viewport) return null

  const Overlay = forwardRef((props, ref) => {
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
  })

  return (
    <RbOverlayTrigger {...attributes} container={viewport} overlay={<Overlay />}>
      {child}
    </RbOverlayTrigger>
  )
}
