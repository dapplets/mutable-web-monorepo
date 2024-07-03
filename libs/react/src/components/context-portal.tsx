import React, { FC, ReactElement, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { IContextNode } from '../../core'
import { InsertionType } from '../../core/adapters/interface'

const DefaultInsertionType: InsertionType = InsertionType.End

export const ContextPortal: FC<{
  context: IContextNode
  children: ReactElement
  injectTo?: string
}> = ({ context, children, injectTo }) => {
  // ToDo: replace insPoints.find with Map
  const target = injectTo
    ? context.insPoints.find((ip) => ip.name === injectTo)
    : { element: context.element, insertionType: DefaultInsertionType }

  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!target || !target.element) return
    if (!containerRef.current) {
      containerRef.current = document.createElement('div')
      containerRef.current.className = 'mweb-context-portal'
    }

    const { element, insertionType } = target

    switch (insertionType) {
      case InsertionType.Before:
        element.before(containerRef.current)
        break
      case InsertionType.After:
        element.after(containerRef.current)
        break
      case InsertionType.Begin:
        element.insertBefore(containerRef.current, element.firstChild)
        break
      case InsertionType.End:
        element.appendChild(containerRef.current)
        break
      default:
        break
    }

    return () => {
      containerRef.current?.remove()
    }
  }, [target])

  if (!target || !target.element || !containerRef.current) return null

  return createPortal(children, containerRef.current)
}
