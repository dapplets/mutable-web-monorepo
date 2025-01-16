import React, { FC, ReactNode } from 'react'
import { EngineContext, EngineContextState } from './engine-context'
import { Engine } from '@mweb/backend'

type Props = {
  engine: Engine
  children?: ReactNode
}

const EngineProvider: FC<Props> = ({ engine, children }) => {
  const state: EngineContextState = {
    engine,
  }

  return <EngineContext.Provider value={state}>{children}</EngineContext.Provider>
}

export { EngineProvider }
