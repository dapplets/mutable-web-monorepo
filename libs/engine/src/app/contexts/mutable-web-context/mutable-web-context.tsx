import { Engine, EntitySourceType } from '@mweb/backend'
import { createContext } from 'react'
import { AppInstanceWithSettings } from '@mweb/backend'
import { MutationWithSettings } from '@mweb/backend'
import { NearConfig } from '@mweb/backend'

export type MutableWebContextState = {
  config: NearConfig
  engine: Engine
  mutations: MutationWithSettings[]
  mutationApps: AppInstanceWithSettings[]
  activeApps: AppInstanceWithSettings[]
  selectedMutation: MutationWithSettings | null
  isLoading: boolean
  switchMutation: (mutationId: string | null) => void
  switchPreferredSource: (mutationId: string, source: EntitySourceType | null) => void
  getPreferredSource: (mutationId: string) => EntitySourceType | null
  favoriteMutationId: string | null
  setFavoriteMutation: (mutationId: string | null) => void
  switchMutationVersion: (mutationId: string, version?: string | null) => void
  mutationVersions: { [key: string]: string | null }
}

export const contextDefaultValues: MutableWebContextState = {
  config: null as any as NearConfig, // ToDo
  engine: null as any as Engine, // ToDo
  mutations: [],
  mutationApps: [],
  activeApps: [],
  isLoading: false,
  selectedMutation: null,
  switchMutation: () => undefined,
  switchPreferredSource: () => undefined,
  getPreferredSource: () => null,
  favoriteMutationId: null,
  setFavoriteMutation: () => undefined,
  switchMutationVersion: () => undefined,
  mutationVersions: {},
}

export const MutableWebContext = createContext<MutableWebContextState>(contextDefaultValues)
