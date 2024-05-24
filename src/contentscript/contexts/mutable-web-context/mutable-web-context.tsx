import { AppMetadata, AppWithSettings, Engine, MutationWithSettings } from 'mutable-web-engine'
import { createContext } from 'react'

export type MutableWebContextState = {
  engine: Engine
  mutations: MutationWithSettings[]
  allApps: AppMetadata[]
  mutationApps: AppWithSettings[]
  selectedMutation: MutationWithSettings | null
  isLoading: boolean
  favoriteMutationId: string | null
  stopEngine: () => void
  switchMutation: (mutationId: string) => void
  setFavoriteMutation: (mutationId: string | null) => void
  removeMutationFromRecents: (mutationId: string) => void
  setMutations: React.Dispatch<React.SetStateAction<MutationWithSettings[]>>
  setMutationApps: React.Dispatch<React.SetStateAction<AppWithSettings[]>>
}

export const contextDefaultValues: MutableWebContextState = {
  engine: null as any as Engine, // ToDo
  mutations: [],
  allApps: [],
  mutationApps: [],
  isLoading: false,
  selectedMutation: null,
  favoriteMutationId: null,
  stopEngine: () => undefined,
  switchMutation: () => undefined,
  setFavoriteMutation: () => undefined,
  removeMutationFromRecents: () => undefined,
  setMutations: () => undefined,
  setMutationApps: () => undefined,
}

export const MutableWebContext = createContext<MutableWebContextState>(contextDefaultValues)
