import { Engine } from '@mweb/backend'
import { createContext } from 'react'
import { AppInstanceWithSettings } from '@mweb/backend'
import { ApplicationDto } from '@mweb/backend'
import { MutationWithSettings } from '@mweb/backend'
import { MutationDto } from '@mweb/backend'
import { NearConfig } from '@mweb/backend'

export type MutableWebContextState = {
  config: NearConfig
  engine: Engine
  mutations: MutationWithSettings[]
  allApps: ApplicationDto[]
  mutationApps: AppInstanceWithSettings[]
  activeApps: AppInstanceWithSettings[]
  selectedMutation: MutationWithSettings | null
  refreshMutation: (mutation: MutationDto) => Promise<void>
  isLoading: boolean
  switchMutation: (mutationId: string | null) => void
  favoriteMutationId: string | null
  setFavoriteMutation: (mutationId: string | null) => void
  removeMutationFromRecents: (mutationId: string) => void
  setMutations: React.Dispatch<React.SetStateAction<MutationWithSettings[]>>
  setMutationApps: React.Dispatch<React.SetStateAction<AppInstanceWithSettings[]>>
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
