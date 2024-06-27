import React, { FC, useEffect, useMemo, useRef, ReactElement } from 'react'
import ReactDOMServer from 'react-dom/server'
import { IContextNode } from '../core'
import Lightning from './assets/icons/lightning'

const DEFAULT_BORDER_RADIUS = 6 // px
const DEFAULT_BORDER_COLOR = '#384BFF' // blue
const DEFAULT_INACTIVE_BORDER_COLOR = '#384BFF4D' // light blue
const DEFAULT_BORDER_STYLE = 'solid'
const DEFAULT_CHILDREN_BORDER_STYLE = 'dashed'
const DEFAULT_BORDER_WIDTH = 2 //px
const DEFAULT_BACKGROUND_COLOR = 'rgb(56 188 255 / 5%)' // light light blue
const PRIVILEGED_NAMESPACE = 'mweb' // ToDo: hardcode. Needs to be fixed.

const getElementDepth = (el: Element | Node) => {
  let depth = 0
  let host = (el as any).host
  while (el.parentNode !== null || host) {
    if (host) el = host as Node
    el = el.parentNode!
    host = (el as any).host
    depth++
  }
  return depth
}

const getContextDepth = (context: IContextNode): number => {
  return context.element ? getElementDepth(context.element) : 0
}

interface IHighlighter {
  focusedContext: IContextNode | null
  context: IContextNode
  onMouseEnter: () => void
  onMouseLeave: () => void
  styles?: React.CSSProperties
  onClick?: (() => void) | null
  highlightChildren?: boolean
  variant?: 'primary' | 'secondary'
  LatchComponent?: React.FC<{
    context: IContextNode
    variant: 'primary' | 'secondary'
    contextDimensions: { width: number; height: number }
  }>
  children?: ReactElement | ReactElement[]
}

export const Highlighter: FC<IHighlighter> = ({
  focusedContext,
  context,
  onMouseEnter,
  onMouseLeave,
  styles,
  onClick,
  highlightChildren,
  variant,
  LatchComponent,
  children,
}) => {
  const pickerRef = useRef<any>(null)

  const bodyOffset = document.documentElement.getBoundingClientRect()
  const targetOffset = context.element?.getBoundingClientRect()

  // ToDo: find a better way to check null
  // Checks that LatchComponent is not rendered as null
  const hasLatch = useMemo(
    () =>
      LatchComponent
        ? !!ReactDOMServer.renderToStaticMarkup(
            <LatchComponent
              context={context}
              variant={variant ?? 'secondary'}
              contextDimensions={{
                width: targetOffset?.width || 0,
                height: targetOffset?.height || 0,
              }}
            />
          ).trim()
        : false,
    [context]
  )

  useEffect(() => {
    if (hasLatch) {
      context.element?.addEventListener('mouseenter', onMouseEnter)
      context.element?.addEventListener('mouseleave', onMouseLeave)
    }
    if (!pickerRef.current) return
    pickerRef.current.addEventListener('mouseenter', onMouseEnter)
    pickerRef.current.addEventListener('mouseleave', onMouseLeave)

    return () => {
      if (hasLatch) {
        context.element?.removeEventListener('mouseenter', onMouseEnter)
        context.element?.removeEventListener('mouseleave', onMouseLeave)
      }
      if (!pickerRef.current) return
      pickerRef.current.removeEventListener('mouseenter', onMouseEnter)
      pickerRef.current.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [pickerRef.current])

  if (!context.element || !targetOffset) return null

  const isFirstLevelContext = !context.parentNode || context.parentNode.contextType === 'root'
  const contextDepth = getContextDepth(context)
  const backgroundColor = onClick
    ? styles?.backgroundColor ?? DEFAULT_BACKGROUND_COLOR
    : 'transparent'
  const opacity =
    variant === 'primary' ||
    (variant === 'secondary' && highlightChildren) ||
    (!focusedContext && isFirstLevelContext)
      ? 1
      : 0
  const border =
    styles?.border ??
    `${DEFAULT_BORDER_WIDTH}px ${isFirstLevelContext ? DEFAULT_BORDER_STYLE : DEFAULT_CHILDREN_BORDER_STYLE} ${variant === 'primary' ? DEFAULT_BORDER_COLOR : DEFAULT_INACTIVE_BORDER_COLOR}`

  const zIndex =
    100000 * (context.namespace === PRIVILEGED_NAMESPACE ? 1000 : 1) + (contextDepth ?? 0)

  if (hasLatch) {
    const wrapperStyle: React.CSSProperties = {
      transition: 'all .2s ease-in-out',
      opacity,
    }

    const topStyle: React.CSSProperties = {
      left: targetOffset.left + 4 - bodyOffset.left,
      top: targetOffset.top - 1 - bodyOffset.top,
      width: targetOffset.width - ((styles?.borderRadius as number) ?? DEFAULT_BORDER_RADIUS),
      height: 2,
      position: 'absolute',
      zIndex,
      borderTop: border,
    }

    const bottomStyle: React.CSSProperties = {
      left: targetOffset.left + 4 - bodyOffset.left,
      top: targetOffset.top + targetOffset.height - 1 - bodyOffset.top,
      width: targetOffset.width - ((styles?.borderRadius as number) ?? DEFAULT_BORDER_RADIUS),
      height: 2,
      position: 'absolute',
      zIndex,
      borderBottom: border,
    }

    const leftStyle: React.CSSProperties = {
      left: targetOffset.left - 2 - bodyOffset.left,
      top: targetOffset.top - 1 - bodyOffset.top,
      height: targetOffset.height + 2,
      width: (styles?.borderRadius as number) ?? DEFAULT_BORDER_RADIUS,
      position: 'absolute',
      zIndex,
      borderLeft: border,
      borderTop: border,
      borderBottom: border,
      borderRadius: `${(styles?.borderRadius as number) ?? DEFAULT_BORDER_RADIUS}px 0 0 ${(styles?.borderRadius as number) ?? DEFAULT_BORDER_RADIUS}px`,
    }

    const rightStyle: React.CSSProperties = {
      left: targetOffset.left + targetOffset.width - 2 - bodyOffset.left,
      top: targetOffset.top - 1 - bodyOffset.top,
      height: targetOffset.height + 2,
      width: (styles?.borderRadius as number) ?? DEFAULT_BORDER_RADIUS,
      position: 'absolute',
      zIndex,
      borderRight: border,
      borderTop: border,
      borderBottom: border,
      borderRadius: `0 ${(styles?.borderRadius as number) ?? DEFAULT_BORDER_RADIUS}px ${(styles?.borderRadius as number) ?? DEFAULT_BORDER_RADIUS}px 0`,
    }

    return (
      <div style={wrapperStyle} className="mweb-picker" ref={pickerRef}>
        {LatchComponent && (
          <div
            style={{
              position: 'absolute',
              left: targetOffset.left + 4 - bodyOffset.left,
              top: targetOffset.top - 1 - bodyOffset.top,
              zIndex: zIndex + 1,
            }}
          >
            <LatchComponent
              context={context}
              variant={variant ?? 'secondary'}
              contextDimensions={{
                width: targetOffset.width,
                height: targetOffset.height,
              }}
            />
          </div>
        )}
        <div style={topStyle}></div>
        <div style={leftStyle}></div>
        <div style={rightStyle}></div>
        <div style={bottomStyle}></div>
      </div>
    )
  }

  const wrapperStyle: React.CSSProperties = {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    top: targetOffset.top - bodyOffset.top,
    left: targetOffset.left - bodyOffset.left,
    width: targetOffset.width,
    height: targetOffset.height,
    borderRadius: styles?.borderRadius ?? DEFAULT_BORDER_RADIUS,
    border,
    transition: 'all .2s ease-in-out',
    cursor: 'pointer',
    zIndex,
    opacity,
    backgroundColor,
  }

  return (
    <div
      ref={pickerRef}
      style={wrapperStyle}
      className="mweb-picker"
      onClick={onClick ?? undefined}
    >
      {children && (!Array.isArray(children) || children.length) ? (
        <div style={{ opacity: variant === 'primary' ? 1 : 0.5 }}>{children}</div>
      ) : (
        <Lightning
          color={variant === 'primary' ? DEFAULT_BORDER_COLOR : DEFAULT_INACTIVE_BORDER_COLOR}
        />
      )}
    </div>
  )
}
