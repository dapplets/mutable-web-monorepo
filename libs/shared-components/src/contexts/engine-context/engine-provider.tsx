import React, { FC, ReactNode } from 'react'
import { EngineContext, EngineContextState } from './engine-context'
import { EntitySourceType } from '@mweb/backend'
import { IContextNode } from '@mweb/core'

type Props = {
  tree: IContextNode | null
  loggedInAccountId: string | null
  nearNetwork: string
  onConnectWallet: () => Promise<void>
  onDisconnectWallet: () => Promise<void>
  selectedMutationId: string | null
  favoriteMutationId: string | null
  onSetFavoriteMutation: (mutationId: string | null) => void
  onSwitchMutation: (mutationId: string | null) => void
  onGetPreferredSource: (mutationId: string) => EntitySourceType | null // ToDo: refactor
  children?: ReactNode
}

const EngineProvider: FC<Props> = ({
  tree,
  loggedInAccountId,
  nearNetwork,
  onConnectWallet,
  onDisconnectWallet,
  selectedMutationId,
  favoriteMutationId,
  onSetFavoriteMutation,
  onSwitchMutation,
  onGetPreferredSource,
  children,
}) => {
  const state: EngineContextState = {
    tree,
    loggedInAccountId,
    nearNetwork,
    onConnectWallet,
    onDisconnectWallet,
    selectedMutationId,
    favoriteMutationId,
    onSetFavoriteMutation,
    onSwitchMutation,
    onGetPreferredSource,
  }

  return <EngineContext.Provider value={state}>{children}</EngineContext.Provider>
}

export { EngineProvider }
