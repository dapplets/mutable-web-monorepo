import { createContext } from 'react'
import { MutationWithSettings } from '@mweb/backend'

export type MutationsContextState = {
  mutations: MutationWithSettings[]
  setMutations: React.Dispatch<React.SetStateAction<MutationWithSettings[]>>
  isLoading: boolean
}

export const contextDefaultValues: MutationsContextState = {
  mutations: [],
  setMutations: () => undefined,
  isLoading: true,
}

export const MutationsContext = createContext<MutationsContextState>(contextDefaultValues)
