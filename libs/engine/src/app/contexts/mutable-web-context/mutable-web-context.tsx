import { Engine, EntitySourceType } from '@mweb/backend'
import { createContext } from 'react'
import { AppInstanceWithSettings } from '@mweb/backend'
import { MutationDto } from '@mweb/backend'
import { NearConfig } from '@mweb/backend'
import { IContextNode } from '@mweb/core'

export type MutableWebContextState = {
  config: NearConfig
  engine: Engine
  tree: IContextNode | null
  mutationApps: AppInstanceWithSettings[]
  activeApps: AppInstanceWithSettings[]
  selectedMutation: MutationDto | null
  selectedMutationId: string | null
  isLoading: boolean
  switchMutation: (mutationId: string | null) => void
}

export const contextDefaultValues: MutableWebContextState = {
  config: null as any as NearConfig, // ToDo
  engine: null as any as Engine, // ToDo
  tree: null,
  mutationApps: [],
  activeApps: [],
  isLoading: false,
  selectedMutation: null,
  selectedMutationId: null,
  switchMutation: () => undefined,
}

export const MutableWebContext = createContext<MutableWebContextState>(contextDefaultValues)
