import { Engine } from '../../../engine'
import { createContext } from 'react'
import { AppInstanceWithSettings } from '../../services/application/application.entity'
import { ApplicationDto } from '../../services/application/dtos/application.dto'
import { MutationWithSettings } from '../../services/mutation/mutation.entity'
import { MutationDto } from '../../services/mutation/dtos/mutation.dto'
import { NearConfig } from '../../../constants'

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
