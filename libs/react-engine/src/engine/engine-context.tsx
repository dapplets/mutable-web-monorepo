import { createContext } from 'react'
import { Engine } from '@mweb/backend'

export type EngineContextState = {
  engine: Engine
}

export const contextDefaultValues: EngineContextState = {
  engine: null as any,
}

export const EngineContext = createContext<EngineContextState>(contextDefaultValues)
