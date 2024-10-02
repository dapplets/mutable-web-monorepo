import React from 'react'
import { ContextTree, useCore } from '@mweb/react'
import { utils } from '@mweb/backend'
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
            ? highlighterTask.target.map((t) => utils.isTargetMet(t, context)).includes(true)
            : utils.isTargetMet(highlighterTask.target, context)
          : true

        const calloutLevel =
          context.contextLevel === 'callout' &&
          context.element?.attributes?.getNamedItem('data-context-level')?.value

        return isSuitable && context.element ? (
          <Highlighter
            el={context.element}
            styles={{
              ...highlighterTask.styles,
              opacity: 1,
              zIndex:
                1000 *
                (context.contextLevel === 'system'
                  ? 6
                  : calloutLevel === 'default'
                    ? 3
                    : calloutLevel === 'system'
                      ? 8
                      : 1),
              position:
                context.contextLevel === 'default' || calloutLevel === 'default'
                  ? 'absolute'
                  : 'fixed',
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
