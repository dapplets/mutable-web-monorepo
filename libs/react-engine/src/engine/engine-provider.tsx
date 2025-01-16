import React, { FC, ReactNode } from 'react'
import { EngineContext, EngineContextState } from './engine-context'
import { Engine } from '@mweb/backend'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

type Props = {
  engine: Engine
  children?: ReactNode
}

const queryClient = new QueryClient()

const EngineProvider: FC<Props> = ({ engine, children }) => {
  const state: EngineContextState = {
    engine,
  }

  return (
    <EngineContext.Provider value={state}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </EngineContext.Provider>
  )
}

export { EngineProvider }
