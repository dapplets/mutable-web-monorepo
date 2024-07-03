import React from 'react'
import { ContextTree, useCore } from '../../../react'
import { TargetService } from '../services/target/target.service'
import { useHighlighter } from '../contexts/highlighter-context'
import { Highlighter } from './highlighter'

export const ContextHighlighter = () => {
  const { tree } = useCore()
  const { highlighterTask } = useHighlighter()

  if (!tree || !highlighterTask) return null
  return (
    <ContextTree>
      {({ context }) => {
        const isSuitable = highlighterTask?.target
          ? Array.isArray(highlighterTask.target)
            ? highlighterTask.target
                .map((t) => TargetService.isTargetMet(t, context))
                .includes(true)
            : TargetService.isTargetMet(highlighterTask.target, context)
          : true

        return isSuitable && context.element ? (
          <Highlighter
            el={context.element}
            styles={{
              ...highlighterTask.styles,
              opacity: 1,
            }}
            isFilled={highlighterTask.isFilled}
            children={highlighterTask.icon}
            action={highlighterTask.action}
          />
        ) : null
      }}
    </ContextTree>
  )
}
