import React, { FC, ReactElement, useCallback, useRef } from 'react'
import { Core, ParserConfig } from '@mweb/core'
import { CoreContext, CoreContextState } from './core-context'

type Props = {
  initialParserConfigs?: ParserConfig[]
  children: ReactElement
}

const CoreProvider: FC<Props> = ({ initialParserConfigs, children }) => {
  const coreRef = useRef<Core | null>(null)

  if (!coreRef.current) {
    const core = new Core()

    initialParserConfigs?.forEach((parserConfig) => {
      core.attachParserConfig(parserConfig)
    })

    coreRef.current = core

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
