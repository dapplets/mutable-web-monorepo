import { createContext } from 'react'
import { BosRedirectMap } from '../../services/dev-server-service'
import { Target } from '../../services/target/target.entity'

export type InjectableTarget = Target & {
  injectTo: string
}

export type EngineContextState = {
  portals: Map<string, { component: React.FC<unknown>; target: InjectableTarget }>
  addPortal: <T>(key: string, target: InjectableTarget, cmp: React.FC<T>) => void
  removePortal: <T>(key: string) => void
  redirectMap: BosRedirectMap | null
}

export const contextDefaultValues: EngineContextState = {
  portals: new Map(),
  addPortal: () => undefined,
  removePortal: () => undefined,
  redirectMap: null,
}

export const EngineContext = createContext<EngineContextState>(contextDefaultValues)
