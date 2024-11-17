import { Engine, EntitySourceType } from '@mweb/backend'
import { createContext } from 'react'
import { AppInstanceWithSettings } from '@mweb/backend'
import { ApplicationDto } from '@mweb/backend'
import { MutationWithSettings } from '@mweb/backend'
import { MutationDto } from '@mweb/backend'
import { NearConfig } from '@mweb/backend'

export type MutableWebContextState = {
  config: NearConfig
  engine: Engine
  allApps: ApplicationDto[]
  mutationApps: AppInstanceWithSettings[]
  activeApps: AppInstanceWithSettings[]
  selectedMutation: MutationWithSettings | null
  refreshSelectedMutation: (mutation: MutationDto) => Promise<void>
  isLoading: boolean
  switchMutation: (mutationId: string | null) => void
  switchPreferredSource: (source: EntitySourceType | null) => void
  favoriteMutationId: string | null
  setFavoriteMutation: (mutationId: string | null) => void
  setMutationApps: React.Dispatch<React.SetStateAction<AppInstanceWithSettings[]>>
  switchMutationVersion: (version: string | null) => void
  preferredSource: EntitySourceType | null
  mutationVersion: string | null
}

export const contextDefaultValues: MutableWebContextState = {
  config: null as any as NearConfig, // ToDo
  engine: null as any as Engine, // ToDo
  allApps: [],
  mutationApps: [],
  activeApps: [],
  isLoading: false,
  selectedMutation: null,
  switchMutation: () => undefined,
  switchPreferredSource: () => undefined,
  refreshSelectedMutation: () => Promise.resolve(undefined),
  favoriteMutationId: null,
  setFavoriteMutation: () => undefined,
  setMutationApps: () => undefined,
  switchMutationVersion: () => undefined,
  preferredSource: null,
  mutationVersion: null,
}

export const MutableWebContext = createContext<MutableWebContextState>(contextDefaultValues)
