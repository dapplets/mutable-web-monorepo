import { createContext } from 'react'
import { IContextNode } from '@mweb/core'

export type EngineContextState = {
  tree: IContextNode | null
  loggedInAccountId: string | null
  nearNetwork: string
  onConnectWallet: () => Promise<void>
  onDisconnectWallet: () => Promise<void>

  selectedMutationId: string | null
  onSwitchMutation: (mutationId: string | null) => void
}

export const contextDefaultValues: EngineContextState = {
  tree: null,
  loggedInAccountId: null,
  nearNetwork: '',
  onConnectWallet: async () => {},
  onDisconnectWallet: async () => {},
  selectedMutationId: null,
  onSwitchMutation: () => {},
}

export const EngineContext = createContext<EngineContextState>(contextDefaultValues)
