import { createContext } from 'react'
import { BosRedirectMap } from '../../services/dev-server-service'
import { Target } from '../../services/target/target.entity'
import { TransferableContext } from '../../common/transferable-context'

export type InjectableTarget = Target & {
  injectTo: string
}

export type Portal = {
  target: InjectableTarget
  component?: React.FC // ToDo: add props
  onContextStarted?: (context: TransferableContext) => void
  onContextFinished?: (context: TransferableContext) => void
}

export type EngineContextState = {
  portals: Map<string, Portal>
  addPortal: (key: string, portal: Portal) => void
  removePortal: (key: string) => void
  redirectMap: BosRedirectMap | null
  isDevServerLoading: boolean
}

export const contextDefaultValues: EngineContextState = {
  portals: new Map(),
  addPortal: () => undefined,
  removePortal: () => undefined,
  redirectMap: null,
  isDevServerLoading: false,
}

export const EngineContext = createContext<EngineContextState>(contextDefaultValues)
