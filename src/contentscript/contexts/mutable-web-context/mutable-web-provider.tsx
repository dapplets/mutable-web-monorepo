import { AppMetadata, Engine, MutationWithSettings } from 'mutable-web-engine'
import React, { FC, ReactElement, useEffect, useMemo, useState } from 'react'
import { MutableWebContext, MutableWebContextState } from './mutable-web-context'

type Props = {
  engine: Engine
  children: ReactElement
}

const MutableWebProvider: FC<Props> = ({ children, engine }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMutationId, setSelectedMutationId] = useState<string | null>(null)
  const [mutations, setMutations] = useState<MutationWithSettings[]>([])
  const [apps, setApps] = useState<AppMetadata[]>([])
  const [favoriteMutationId, setFavoriteMutationId] = useState<string | null>(null)

  const loadMutations = async (engine: Engine) => {
    const [mutations, allApps, selectedMutation, favoriteMutationId] = await Promise.all([
      engine.getMutations(),
      engine.getApplications(),
      engine.getCurrentMutation(),
      engine.getFavoriteMutation(),
    ])

    setMutations(mutations)
    setApps(allApps)
    setSelectedMutationId(selectedMutation?.id ?? null)
    setFavoriteMutationId(favoriteMutationId)
  }

  const selectedMutation = useMemo(
    () => mutations.find((mut) => mut.id === selectedMutationId) ?? null,
    [mutations, selectedMutationId]
  )

  useEffect(() => {
    loadMutations(engine)
  }, [engine])

  const stopEngine = () => {
    setSelectedMutationId(null)
    engine.stop()
  }

  // ToDo: move to separate hook
  const switchMutation = async (mutationId: string) => {
    setSelectedMutationId(mutationId)

    try {
      setIsLoading(true)

      if (engine.started) {
        await engine.switchMutation(mutationId)
      } else {
        await engine.start(mutationId)
      }
    } catch (err) {
      console.error(err)
      // ToDo: save previous mutation and switch back if failed
    } finally {
      setMutations(await engine.getMutations())
      setIsLoading(false)
    }
  }

  // ToDo: move to separate hook
  const setFavoriteMutation = async (mutationId: string | null) => {
    const previousFavoriteMutationId = favoriteMutationId

    try {
      setFavoriteMutationId(mutationId)
      await engine.setFavoriteMutation(mutationId)
    } catch (err) {
      console.error(err)
      setFavoriteMutationId(previousFavoriteMutationId)
    }
  }

  // ToDo: move to separate hook
  const removeMutationFromRecents = async (mutationId: string) => {
    try {
      await engine.removeMutationFromRecents(mutationId)
      setMutations(await engine.getMutations())
    } catch (err) {
      console.error(err)
    }
  }

  const state: MutableWebContextState = {
    engine,
    mutations,
    apps,
    selectedMutation,
    isLoading,
    favoriteMutationId,
    stopEngine,
    switchMutation,
    setFavoriteMutation,
    removeMutationFromRecents,
    setMutations,
  }

  return <MutableWebContext.Provider value={state}>{children}</MutableWebContext.Provider>
}

export { MutableWebProvider }
