import { Engine, EntitySourceType } from '@mweb/backend'
import { createContext } from 'react'
import { AppInstanceWithSettings } from '@mweb/backend'
import { MutationWithSettings } from '@mweb/backend'
import { NearConfig } from '@mweb/backend'
import { IContextNode } from '@mweb/core'

export type MutableWebContextState = {
  config: NearConfig
  engine: Engine
  tree: IContextNode | null
  mutations: MutationWithSettings[]
  mutationApps: AppInstanceWithSettings[]
  activeApps: AppInstanceWithSettings[]
  selectedMutation: MutationWithSettings | null
  isLoading: boolean
  switchMutation: (mutationId: string | null) => void
  switchPreferredSource: (mutationId: string, source: EntitySourceType | null) => void
  getPreferredSource: (mutationId: string) => EntitySourceType | null
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
  switchMutation: () => undefined,
  switchPreferredSource: () => undefined,
  getPreferredSource: () => null,
  switchMutationVersion: () => undefined,
  mutationVersions: {},
}

export const MutableWebContext = createContext<MutableWebContextState>(contextDefaultValues)
