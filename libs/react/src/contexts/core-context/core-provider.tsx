import React, { FC, ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import { CoreContext, CoreContextState } from './core-context'
import { Core, IContextNode, ParserConfig } from '@mweb/core'

type Props = {
  children: ReactElement
}

const CoreProvider: FC<Props> = ({ children }) => {
  const coreRef = useRef<Core | null>(null)

  if (!coreRef.current) {
    coreRef.current = new Core()

    console.log('[@mweb/react] Initialized core', coreRef.current)
  }

  const core = coreRef.current

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
