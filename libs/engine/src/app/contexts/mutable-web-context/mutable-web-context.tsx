import { Engine } from '@mweb/backend'
import { createContext } from 'react'
import { AppInstanceWithSettings } from '@mweb/backend'
import { MutationDto } from '@mweb/backend'
import { NearConfig } from '@mweb/backend'
import { IContextNode } from '@mweb/core'

export type MutableWebContextState = {
  config: NearConfig
  engine: Engine
  tree: IContextNode | null
  activeApps: AppInstanceWithSettings[]
  selectedMutation: MutationDto | null
  selectedMutationId: string | null
  isEngineLoading: boolean
}

export const contextDefaultValues: MutableWebContextState = {
  config: null as any as NearConfig, // ToDo
  engine: null as any as Engine, // ToDo
  tree: null,
  activeApps: [],
  isEngineLoading: false,
  selectedMutation: null,
  selectedMutationId: null,
}

export const MutableWebContext = createContext<MutableWebContextState>(contextDefaultValues)
