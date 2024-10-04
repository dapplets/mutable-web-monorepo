import { createContext } from 'react'
import { BosRedirectMap } from '@mweb/backend'
import { Target } from '@mweb/backend'
import { TransferableContext } from '@mweb/backend'
import { IContextNode } from '@mweb/core'

export type InjectableTarget = (Target | TransferableContext) & {
  injectTo?: string
}

export type PortalComponent = React.FC<{
  context: TransferableContext
  attachContextRef: (callback: (r: React.Component | Element | null | undefined) => void) => void
  attachInsPointRef: (callback: (r: React.Component | Element | null | undefined) => void) => void
}>

export type Portal = {
  component?: PortalComponent
  target: InjectableTarget
  key: string
  inMemory: boolean
  onContextStarted?: (context: IContextNode) => void
  onContextFinished?: (context: IContextNode) => void
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
