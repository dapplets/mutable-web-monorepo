import * as React from 'react'
import { createPortal } from 'react-dom'
import { StyleSheetManager } from 'styled-components'

export interface ShadowDomWrapperProps {
  children: React.ReactNode
}

export const ShadowDomWrapper = React.forwardRef<HTMLDivElement, ShadowDomWrapperProps>(
  ({ children }, ref) => {
    const myRef = React.useRef<HTMLDivElement | null>(null)
    const [root, setRoot] = React.useState<{
      container: HTMLDivElement
      stylesMountPoint: HTMLDivElement
    } | null>(null)

    React.useLayoutEffect(() => {
      if (myRef.current) {
        const EventsToStopPropagation = ['click', 'keydown', 'keyup', 'keypress']

        const shadowRoot = myRef.current.attachShadow({ mode: 'closed' })
        const stylesMountPoint = document.createElement('div')
        const container = document.createElement('div')
        shadowRoot.appendChild(stylesMountPoint)

        // It will prevent inheritance without affecting other CSS defined within the ShadowDOM.
        // https://stackoverflow.com/a/68062098
        const resetCssRules = `
            :host { 
            all: initial; 
            display: flex; 
            align-items: center;
            justify-content: center;
            position: relative;
            visibility: visible !important;
            }
        `
        const disableCssInheritanceStyle = document.createElement('style')
        disableCssInheritanceStyle.innerHTML = resetCssRules
        shadowRoot.appendChild(disableCssInheritanceStyle)

        shadowRoot.appendChild(container)

        // Prevent event propagation from BOS-component to parent
        EventsToStopPropagation.forEach((eventName) => {
          myRef.current!.addEventListener(eventName, (e) => e.stopPropagation())
        })

        setRoot({ container, stylesMountPoint })
      } else {
        setRoot(null)
      }
    }, [myRef])

    return (
      <div
        ref={(node) => {
          myRef.current = node
          if (typeof ref === 'function') {
            ref(node)
          } else if (ref) {
            ref.current = node
          }
        }}
      >
        {root
          ? createPortal(
              <StyleSheetManager target={root.stylesMountPoint}>{children}</StyleSheetManager>,
              root.container
            )
          : null}
      </div>
    )
  }
)

ShadowDomWrapper.displayName = 'ShadowDomWrapper'
