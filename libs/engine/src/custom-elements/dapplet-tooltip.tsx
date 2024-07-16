import React, { useEffect, useImperativeHandle, useRef } from 'react'
import { Tooltip as RbTooltip } from 'react-bootstrap'

const ShowDelay = 300

export const DappletTooltip = React.forwardRef(({ children, ...attributes }: any, ref) => {
  const innerRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => innerRef.current, [])

  useEffect(() => {
    if (!innerRef.current) return

    if (attributes.hasDoneInitialMeasure) {
      const timer = setTimeout(() => {
        if (!innerRef.current) return
        innerRef.current.style.visibility = ''
        innerRef.current.style.opacity = '1'
      }, ShowDelay)
      return () => clearTimeout(timer)
    } else {
      innerRef.current.style.visibility = 'hidden'
      innerRef.current.style.opacity = '0'
    }
  }, [attributes.hasDoneInitialMeasure, innerRef])

  return (
    <RbTooltip {...attributes} ref={innerRef}>
      {children}
    </RbTooltip>
  )
})
