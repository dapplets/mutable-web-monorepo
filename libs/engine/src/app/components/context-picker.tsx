import React, { FC, useCallback, useMemo, useState } from 'react'
import { ContextTree, useCore } from '../../../react'
import { PickerHighlighter } from './picker-highlighter'
import { TargetService } from '../services/target/target.service'
import { IContextNode } from '../../../core'
import { usePicker } from '../contexts/picker-context'

export const ContextPicker: FC = () => {
  const { tree } = useCore()
  const { pickerTask } = usePicker()

  const [focusedContext, setFocusedContext] = useState<IContextNode | null>(null)

  if (!tree || !pickerTask) return null

  return (
    <ContextTree>
      {({ context }) => {
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
