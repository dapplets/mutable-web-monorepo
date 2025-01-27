import React, { FC, ReactNode } from 'react'
import { EngineContext, EngineContextState } from './engine-context'
import { IContextNode } from '@mweb/core'

type Props = {
  tree: IContextNode | null
  loggedInAccountId: string | null
  nearNetwork: string
  onConnectWallet: () => Promise<void>
  onDisconnectWallet: () => Promise<void>
  selectedMutationId: string | null
  onSwitchMutation: (mutationId: string | null) => void
  children?: ReactNode
}

const EngineProvider: FC<Props> = ({
  tree,
  loggedInAccountId,
  nearNetwork,
  onConnectWallet,
  onDisconnectWallet,
  selectedMutationId,
  onSwitchMutation,
  children,
}) => {
  const state: EngineContextState = {
    tree,
    loggedInAccountId,
    nearNetwork,
    onConnectWallet,
    onDisconnectWallet,
    selectedMutationId,
    onSwitchMutation,
  }

  return <EngineContext.Provider value={state}>{children}</EngineContext.Provider>
}

export { EngineProvider }
