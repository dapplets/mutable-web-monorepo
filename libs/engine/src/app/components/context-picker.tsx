import React, { FC, useCallback, useMemo, useState } from 'react'
import { ContextTree, useCore } from '@mweb/react'
import { PickerHighlighter } from './picker-highlighter'
import { TargetService } from '../services/target/target.service'
import { IContextNode } from '@mweb/core'
import { usePicker } from '../contexts/picker-context'

const isTopContext = (context: IContextNode): boolean => {
  return context.contextType === 'website' && context.namespace === 'engine'
}

export const ContextPicker: FC = () => {
  const { tree } = useCore()
  const { pickerTask } = usePicker()

  const [focusedContext, setFocusedContext] = useState<IContextNode | null>(null)

  if (!tree || !pickerTask) return null

  return (
    <ContextTree>
      {({ context }) => {
        /** (ToDo)
         * Top level context should not be selectable.
         * They are used to retrieve information about the website and the logged in user,
         * not as a container for adding widgets.
         *  */
        if (
          (context.contextType === 'root' &&
            context.parentNode &&
            isTopContext(context.parentNode)) ||
          isTopContext(context)
        )
          return null

        const isSuitable = useMemo(
          () => pickerTask.target?.some((t) => TargetService.isTargetMet(t, context)) ?? true,
          [pickerTask, context]
        )

        if (!isSuitable) return null

        const variant = useMemo(() => {
          if (focusedContext === context) return 'current'
          if (focusedContext === context.parentNode) return 'child'
          if (focusedContext && context.children.includes(focusedContext)) return 'parent'
        }, [focusedContext, context])

        const handleClick = useCallback(() => {
          pickerTask.onClick?.(context)
        }, [pickerTask, context])

        const handleMouseEnter = useCallback(() => {
          setFocusedContext(context)
        }, [context])

        const handleMouseLeave = useCallback(() => {
          setFocusedContext(null)
        }, [context])

        return (
          <PickerHighlighter
            focusedContext={focusedContext} // ToDo: looks like SRP violation
            context={context}
            variant={variant}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            highlightChildren
            LatchComponent={pickerTask.LatchComponent}
          />
        )
      }}
    </ContextTree>
  )
}
