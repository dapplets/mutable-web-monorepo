import * as React from 'react'
import { createPortal } from 'react-dom'
import { StyleSheetManager } from 'styled-components'

const EventsToStopPropagation = ['click', 'keydown', 'keyup', 'keypress']

const overlay = document.createElement('mutable-web-overlay')

overlay.style.background = '#ffffff88'
overlay.style.position = 'fixed'
overlay.style.display = 'none'
overlay.style.top = '0'
overlay.style.left = '0'
overlay.style.width = '100%'
overlay.style.height = '100%'
overlay.style.overflowX = 'hidden'
overlay.style.overflowY = 'auto'
overlay.style.outline = '0'
overlay.style.fontFamily =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
overlay.style.zIndex = '2147483647'

const shadowRoot = overlay.attachShadow({ mode: 'closed' })
const stylesMountPoint = document.createElement('div')
const container = document.createElement('div')
shadowRoot.appendChild(stylesMountPoint)

// It will prevent inheritance without affecting other CSS defined within the ShadowDOM.
// https://stackoverflow.com/a/68062098
const disableCssInheritanceStyle = document.createElement('style')
disableCssInheritanceStyle.innerHTML = ':host { all: initial; }'
shadowRoot.appendChild(disableCssInheritanceStyle)

shadowRoot.appendChild(container)

// Prevent event propagation from BOS-component to parent
EventsToStopPropagation.forEach((eventName) => {
  overlay.addEventListener(eventName, (e) => e.stopPropagation())
})

document.body.appendChild(overlay)

export interface OverlayProps {
  children: React.ReactNode
}

export const Overlay: React.FC<OverlayProps> = ({ children }) => {
  React.useEffect(() => {
    overlay.style.display = 'block'
    return () => {
      overlay.style.display = 'none'
    }
  }, [])

  return createPortal(
    <StyleSheetManager target={stylesMountPoint}>{children}</StyleSheetManager>,
    container
  )
}
