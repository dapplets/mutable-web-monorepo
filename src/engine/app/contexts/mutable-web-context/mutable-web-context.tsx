import { Engine } from '../../../engine'
import { createContext } from 'react'
import { AppMetadata, AppWithSettings } from '../../services/application/application.entity'
import { MutationWithSettings } from '../../services/mutation/mutation.entity'

export type MutableWebContextState = {
  engine: Engine
  mutations: MutationWithSettings[]
  allApps: AppMetadata[]
  mutationApps: AppWithSettings[]
  activeApps: AppWithSettings[]
  selectedMutation: MutationWithSettings | null
  isLoading: boolean
  switchMutation: (mutationId: string | null) => void
  favoriteMutationId: string | null
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
  activeApps: [],
  isLoading: false,
  selectedMutation: null,
  switchMutation: () => undefined,
  favoriteMutationId: null,
  setFavoriteMutation: () => undefined,
  removeMutationFromRecents: () => undefined,
  setMutations: () => undefined,
  setMutationApps: () => undefined,
}

export const MutableWebContext = createContext<MutableWebContextState>(contextDefaultValues)
