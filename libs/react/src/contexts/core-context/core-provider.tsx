import React, { FC, ReactElement, useCallback, useRef } from 'react'
import { Core, ParserConfig } from '@mweb/core'
import { CoreContext, CoreContextState } from './core-context'

type Props = {
  core: Core
  children: ReactElement
}

const CoreProvider: FC<Props> = ({ core, children }) => {
  const attachParserConfig = useCallback(
    (parserConfig: ParserConfig) => {
      core.attachParserConfig(parserConfig)
    },
    [core]
  )

  const detachParserConfig = useCallback(
    (parserId: string) => {
      core.detachParserConfig(parserId)
    },
    [core]
  )

  const updateRootContext = useCallback(
    (rootParsedContext: any = {}) => {
      core.updateRootContext(rootParsedContext)
    },
    [core]
  )

  const state: CoreContextState = {
    core,
    tree: core.tree,
    attachParserConfig,
    detachParserConfig,
    updateRootContext,
  }

  return <CoreContext.Provider value={state}>{children}</CoreContext.Provider>
}

export { CoreProvider }
