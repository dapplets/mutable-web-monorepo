import React, { FC, ReactElement, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { IContextNode } from '@mweb/core'
import { InsertionType } from '@mweb/core'

const DefaultInsertionType: InsertionType = InsertionType.End

export const ContextPortal: FC<{
  context: IContextNode
  children: ReactElement
  injectTo?: string
}> = ({ context, children, injectTo }) => {
  // ToDo: replace insPoints.find with Map
  const target = injectTo
    ? context.insPoints.find((ip) => ip.name === injectTo)
    : {
        element: context.element,
        insertionType:
          context.contextType === 'blink' ? InsertionType.Replace : DefaultInsertionType,
      }

  if (!target?.element) return null
  if (!target?.insertionType) return null

  return (
    <InsPointPortal element={target.element} insertionType={target.insertionType}>
      {children}
    </InsPointPortal>
  )
}

const InsPointPortal: FC<{
  children: ReactElement
  element: HTMLElement
  insertionType: InsertionType
}> = ({ children, element, insertionType }) => {
  const [container, setContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const _container = document.createElement('div')
    _container.className = 'mweb-context-portal'

    switch (insertionType) {
      case InsertionType.Before:
        element.before(_container)
        break
      case InsertionType.After:
        element.after(_container)
        break
      case InsertionType.Begin:
        element.insertBefore(_container, element.firstChild)
        break
      case InsertionType.End:
        element.appendChild(_container)
        break
      case InsertionType.Replace:
        // ToDo: test with multiple apps
        element.style.display = 'none'
        element.after(_container)
        break
      default:
        break
    }

    setContainer(_container)

    return () => {
      if (insertionType === InsertionType.Replace) {
        // ToDo: handle hidden contexts
        element.style.display = ''
      }

      _container.remove()
      setContainer(null)
    }
  }, [])

  if (!container) return null

  return createPortal(children, container)
}
