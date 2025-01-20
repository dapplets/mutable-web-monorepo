import { createContext } from 'react'
import { EntitySourceType, MutationWithSettings } from '@mweb/backend'
import { IContextNode } from '@mweb/core'

export type EngineContextState = {
  tree: IContextNode | null
  loggedInAccountId: string | null
  nearNetwork: string
  onConnectWallet: () => Promise<void>
  onDisconnectWallet: () => Promise<void>

  selectedMutation: MutationWithSettings | null
  favoriteMutationId: string | null
  onSetFavoriteMutation: (mutationId: string | null) => void
  onSwitchMutation: (mutationId: string | null) => void
  onGetPreferredSource: (mutationId: string) => EntitySourceType | null // ToDo: refactor
}

export const contextDefaultValues: EngineContextState = {
  tree: null,
  loggedInAccountId: null,
  nearNetwork: '',
  onConnectWallet: async () => {},
  onDisconnectWallet: async () => {},
  selectedMutation: null,
  favoriteMutationId: null,
  onSetFavoriteMutation: () => {},
  onSwitchMutation: () => {},
  onGetPreferredSource: () => null,
}

export const EngineContext = createContext<EngineContextState>(contextDefaultValues)
