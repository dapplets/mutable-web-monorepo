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
  mutations: MutationDto[]
  mutationApps: AppInstanceWithSettings[]
  activeApps: AppInstanceWithSettings[]
  selectedMutation: MutationDto | null
  selectedMutationId: string | null
  isLoading: boolean
  switchMutation: (mutationId: string | null) => void
  switchPreferredSource: (mutationId: string, source: EntitySourceType | null) => void
  switchMutationVersion: (mutationId: string, version?: string | null) => void
  mutationVersions: { [key: string]: string | null }
}

export const contextDefaultValues: MutableWebContextState = {
  config: null as any as NearConfig, // ToDo
  engine: null as any as Engine, // ToDo
  tree: null,
  mutations: [],
  mutationApps: [],
  activeApps: [],
  isLoading: false,
  selectedMutation: null,
  selectedMutationId: null,
  switchMutation: () => undefined,
  switchPreferredSource: () => undefined,
  switchMutationVersion: () => undefined,
  mutationVersions: {},
}

export const MutableWebContext = createContext<MutableWebContextState>(contextDefaultValues)
