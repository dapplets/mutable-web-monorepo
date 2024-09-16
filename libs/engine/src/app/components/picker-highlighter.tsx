import React, { FC, useEffect, useMemo, useRef, ReactElement } from 'react'
import ReactDOMServer from 'react-dom/server'
import { IContextNode } from '@mweb/core'
import { Highlighter } from './highlighter'

const DEFAULT_INACTIVE_BORDER_COLOR = '#384BFF4D' // light blue
const DEFAULT_CHILDREN_BORDER_STYLE = 'dashed'

const getElementDepth = (el: Element | Node | ShadowRoot | null | undefined) => {
  let depth = 0
  while (el) {
    depth++
    el = el instanceof ShadowRoot ? el.host : el.parentNode
  }
  return depth
}

interface IPickerHighlighter {
  focusedContext: IContextNode | null
  context: IContextNode
  onMouseEnter: () => void
  onMouseLeave: () => void
  styles?: React.CSSProperties
  onClick?: () => void
  highlightChildren?: boolean
  variant?: 'current' | 'parent' | 'child'
  LatchComponent?: React.FC<{
    context: IContextNode
    variant: 'current' | 'parent' | 'child'
    contextDimensions: { width: number; height: number; top: number; left: number }
  }>
  children?: ReactElement | ReactElement[]
}

export const PickerHighlighter: FC<IPickerHighlighter> = ({
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

  const hasLatch = useMemo(
    () =>
      LatchComponent
        ? !!ReactDOMServer.renderToStaticMarkup(
            <LatchComponent
              context={context}
              variant="current"
              contextDimensions={{
                width: targetOffset?.width || 0,
                height: targetOffset?.height || 0,
                top: targetOffset?.top || 0,
                left: targetOffset?.left || 0,
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
  const contextDepth = context.element ? getElementDepth(context.element) : 0

  const backgroundColor = onClick ? styles?.backgroundColor : 'transparent'

  const opacity =
    variant === 'current' ||
    (variant && highlightChildren) ||
    (!focusedContext && isFirstLevelContext)
      ? 1
      : 0

  const borderWidth = styles?.borderWidth
  const borderStyle =
    styles?.borderStyle ?? !isFirstLevelContext ? DEFAULT_CHILDREN_BORDER_STYLE : undefined
  const borderColor =
    styles?.borderColor ?? variant !== 'current' ? DEFAULT_INACTIVE_BORDER_COLOR : undefined

  const calloutLevel =
    context.contextLevel === 'callout' &&
    context.element?.attributes?.getNamedItem('data-context-level')?.value

  if (calloutLevel === 'callout') return

  const zIndex =
    1000 *
      (context.contextLevel === 'system'
        ? 6
        : calloutLevel === 'default'
          ? 3
          : calloutLevel === 'system'
            ? 8
            : 1) +
    (contextDepth ?? 0)

  const doShowLatch = LatchComponent && (variant === 'current' || variant === 'parent')

  return (
    <div className="mweb-picker" ref={pickerRef}>
      {doShowLatch ? (
        <div
          style={{
            position: 'absolute',
            left: targetOffset.left + 2 - bodyOffset.left,
            top: targetOffset.top - 1 - bodyOffset.top,
            zIndex: zIndex + 1,
          }}
        >
          <LatchComponent
            context={context}
            variant={variant}
            contextDimensions={{
              width: targetOffset.width,
              height: targetOffset.height,
              top: targetOffset.top,
              left: targetOffset.left,
            }}
          />
        </div>
      ) : null}
      <Highlighter
        el={context.element}
        styles={{
          ...styles,
          backgroundColor,
          borderWidth,
          borderStyle,
          borderColor,
          zIndex,
          opacity,
          position:
            context.contextLevel === 'default' || calloutLevel === 'default' ? 'absolute' : 'fixed',
        }}
        isFilled={!hasLatch}
        children={children}
        variant={variant ?? 'parent'}
        action={onClick}
      />
    </div>
  )
}
