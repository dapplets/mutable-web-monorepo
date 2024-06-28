import React, { FC, useEffect, useMemo, useRef, ReactElement } from 'react'
import ReactDOMServer from 'react-dom/server'
import { IContextNode } from '../../../core'
import { getContextDepth } from '../../../core/utils'
import { Highlighter } from './highlighter'

const DEFAULT_INACTIVE_BORDER_COLOR = '#384BFF4D' // light blue
const DEFAULT_CHILDREN_BORDER_STYLE = 'dashed'
const PRIVILEGED_NAMESPACE = 'mweb' // ToDo: hardcode. Needs to be fixed.

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
    contextDimensions: { width: number; height: number }
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

  const zIndex = 1000 * (context.namespace === PRIVILEGED_NAMESPACE ? 10 : 1) + (contextDepth ?? 0)

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
        }}
        isFilled={!hasLatch}
        children={children}
        variant={variant ?? 'parent'}
        action={onClick}
      />
    </div>
  )
}
