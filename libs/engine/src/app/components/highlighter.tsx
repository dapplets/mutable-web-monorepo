import React, { ReactElement } from 'react'
import Lightning from './assets/icons/lightning'

const DEFAULT_BORDER_RADIUS = 6 // px
const DEFAULT_BORDER_COLOR = '#384BFF' // blue
const DEFAULT_INACTIVE_BORDER_COLOR = '#384BFF4D' // light blue // ToDo: duplicated: picker-highlighter.tsx
const DEFAULT_BORDER_STYLE = 'solid'
const DEFAULT_BORDER_WIDTH = 2 //px
const DEFAULT_BACKGROUND_COLOR = 'rgb(56 188 255 / 5%)' // light light blue

export const Highlighter = ({
  el,
  styles,
  isFilled,
  children,
  action,
  variant,
}: {
  el: HTMLElement
  styles: React.CSSProperties
  isFilled?: boolean
  children?: ReactElement | ReactElement[]
  action?: () => void
  variant?: 'current' | 'parent' | 'child'
}) => {
  const bodyOffset = document.documentElement.getBoundingClientRect()
  const targetOffset = el.getBoundingClientRect()
  const bodyOffsetTop = styles.position === 'absolute' ? bodyOffset.top : 0

  const backgroundColor = isFilled
    ? styles.backgroundColor ?? DEFAULT_BACKGROUND_COLOR
    : 'transparent'

  const borderWidth = styles.borderWidth ?? DEFAULT_BORDER_WIDTH
  const borderStyle = styles.borderStyle ?? DEFAULT_BORDER_STYLE
  const borderColor = styles.borderColor ?? DEFAULT_BORDER_COLOR
  const border = styles.border ?? `${borderWidth}px ${borderStyle} ${borderColor}`

  const zIndex = styles.zIndex ?? 10000000 // ToDo: rethink it
  const borderRadius = (styles.borderRadius as number) ?? DEFAULT_BORDER_RADIUS

  if (!isFilled) {
    const wrapperStyle: React.CSSProperties = {
      transition: 'all .2s ease-in-out',
      opacity: styles.opacity,
    }

    const borderWidth = (styles.borderWidth as number) ?? DEFAULT_BORDER_WIDTH

    const topStyle: React.CSSProperties = {
      left: targetOffset.left - bodyOffset.left + borderWidth * 2,
      top: targetOffset.top - 1 - bodyOffsetTop,
      width: targetOffset.width - borderRadius - borderWidth,
      height: borderWidth,
      position: styles.position,
      zIndex,
      borderTop: border,
    }

    const bottomStyle: React.CSSProperties = {
      left: targetOffset.left - bodyOffset.left + borderWidth * 2,
      top: targetOffset.top + targetOffset.height - 1 - bodyOffsetTop,
      width: targetOffset.width - borderRadius - borderWidth,
      height: borderWidth,
      position: styles.position,
      zIndex,
      borderBottom: border,
    }

    const leftStyle: React.CSSProperties = {
      left: targetOffset.left - bodyOffset.left - borderWidth,
      top: targetOffset.top - 1 - bodyOffsetTop,
      height: targetOffset.height + borderWidth,
      width: borderRadius,
      position: styles.position,
      zIndex,
      borderLeft: border,
      borderTop: border,
      borderBottom: border,
      borderRadius: `${borderRadius}px 0 0 ${borderRadius}px`,
    }

    const rightStyle: React.CSSProperties = {
      left: targetOffset.left + targetOffset.width - bodyOffset.left - borderWidth * 2,
      top: targetOffset.top - 1 - bodyOffsetTop,
      height: targetOffset.height + borderWidth,
      width: borderRadius,
      position: styles.position,
      zIndex,
      borderRight: border,
      borderTop: border,
      borderBottom: border,
      borderRadius: `0 ${borderRadius}px ${borderRadius}px 0`,
    }

    return (
      <div style={wrapperStyle} className="mweb-highlighter">
        <div style={topStyle}></div>
        <div style={leftStyle}></div>
        <div style={rightStyle}></div>
        <div style={bottomStyle}></div>
      </div>
    )
  }

  const wrapperStyle: React.CSSProperties = {
    position: styles.position,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    top: targetOffset.top - bodyOffsetTop,
    left: targetOffset.left - bodyOffset.left,
    width: targetOffset.width,
    height: targetOffset.height,
    borderRadius: borderRadius,
    border,
    transition: 'all .2s ease-in-out',
    cursor: styles.cursor ?? action ? 'pointer' : 'default',
    zIndex,
    opacity: styles.opacity,
    backgroundColor,
  }

  return (
    <div style={wrapperStyle} className="mweb-highlighter" onClick={action}>
      {children && (!Array.isArray(children) || children.length) ? (
        <div style={{ opacity: !variant || variant === 'current' ? 1 : 0.5 }}>{children}</div>
      ) : (
        <Lightning
          color={
            !variant || variant === 'current' ? DEFAULT_BORDER_COLOR : DEFAULT_INACTIVE_BORDER_COLOR
          }
        />
      )}
    </div>
  )
}
