import React, { FC, ReactNode, useState } from 'react'
import { MutationsContext, MutationsContextState } from './mutations-context'
import { useCore } from '@mweb/react'
import { useQueryArray } from '../../hooks/use-query-array'
import { MutationWithSettings } from '@mweb/backend'
import { useMutableWeb } from '../mutable-web-context'

type Props = {
  children?: ReactNode
}

const MutationsProvider: FC<Props> = ({ children }) => {
  const { core } = useCore()
  const { engine } = useMutableWeb()

  const {
    data: mutations,
    setData: setMutations,
    isLoading,
    error,
  } = useQueryArray<MutationWithSettings>({
    query: () => engine.mutationService.getMutationsWithSettings(core.tree),
    deps: [engine, core],
  })

  const state: MutationsContextState = {
    mutations,
    setMutations,
    isLoading,
  }

  return <MutationsContext.Provider value={state}>{children}</MutationsContext.Provider>
}

export { MutationsProvider }
