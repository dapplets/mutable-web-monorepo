import React, { FC, ReactNode } from 'react'
import { EngineContext, EngineContextState } from './engine-context'
import { Engine } from '@mweb/backend'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSubscriptions } from '../event'

type Props = {
  engine: Engine
  children?: ReactNode
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // default: true
      staleTime: Infinity, // data will be updated by events
    },
  },
})

const ReactQuerySubscriptions: FC = () => {
  useSubscriptions()
  return null
}

const EngineProvider: FC<Props> = ({ engine, children }) => {
  const state: EngineContextState = {
    engine,
  }

  return (
    <EngineContext.Provider value={state}>
      <QueryClientProvider client={queryClient}>
        <ReactQuerySubscriptions />
        {children}
      </QueryClientProvider>
    </EngineContext.Provider>
  )
}

export { EngineProvider }
