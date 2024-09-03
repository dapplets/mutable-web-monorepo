import { Engine } from '../../../engine'
import { createContext } from 'react'
import { AppMetadata, AppWithSettings } from '../../services/application/application.entity'
import { Mutation, MutationWithSettings } from '../../services/mutation/mutation.entity'
import { NearConfig } from '../../../constants'

export type MutableWebContextState = {
  config: NearConfig
  engine: Engine
  mutations: MutationWithSettings[]
  allApps: AppMetadata[]
  mutationApps: AppWithSettings[]
  activeApps: AppWithSettings[]
  selectedMutation: MutationWithSettings | null
  refreshMutation: (mutation: Mutation) => Promise<void>
  isLoading: boolean
  switchMutation: (mutationId: string | null) => void
  favoriteMutationId: string | null
  setFavoriteMutation: (mutationId: string | null) => void
  removeMutationFromRecents: (mutationId: string) => void
  setMutations: React.Dispatch<React.SetStateAction<MutationWithSettings[]>>
  setMutationApps: React.Dispatch<React.SetStateAction<AppWithSettings[]>>
}

export const contextDefaultValues: MutableWebContextState = {
  config: null as any as NearConfig, // ToDo
  engine: null as any as Engine, // ToDo
  mutations: [],
  allApps: [],
  mutationApps: [],
  activeApps: [],
  isLoading: false,
  selectedMutation: null,
  switchMutation: () => undefined,
  refreshMutation: () => Promise.resolve(undefined),
  favoriteMutationId: null,
  setFavoriteMutation: () => undefined,
  removeMutationFromRecents: () => undefined,
  setMutations: () => undefined,
  setMutationApps: () => undefined,
}

export const MutableWebContext = createContext<MutableWebContextState>(contextDefaultValues)
