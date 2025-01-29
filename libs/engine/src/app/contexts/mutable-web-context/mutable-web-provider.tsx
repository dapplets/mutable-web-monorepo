import { EngineConfig, getNearConfig, utils } from '@mweb/backend'
import { useCore } from '@mweb/react'
import {
  useEngine,
  useGetMutationVersion,
  useMutation,
  useMutationApps,
  useMutationParsers,
  usePreferredSource,
} from '@mweb/react-engine'
import React, { FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { ModalContextState } from '../modal-context/modal-context'
import { MutableWebContext, MutableWebContextState } from './mutable-web-context'
import { mutationDisabled, mutationSwitched } from './notifications'

type Props = {
  config: EngineConfig
  defaultMutationId?: string | null
  modalApi: ModalContextState
  children: ReactNode
}

const MutableWebProvider: FC<Props> = ({ config, defaultMutationId, modalApi, children }) => {
  const { tree, attachParserConfig, detachParserConfig, updateRootContext } = useCore()

  if (!tree) throw new Error('Context tree is not initialized')

  const nearConfig = useMemo(() => getNearConfig(config.networkId), [config.networkId])

  const { engine } = useEngine()

  const [selectedMutationId, setSelectedMutationId] = useState<string | null>(null)
  const { preferredSource } = usePreferredSource(selectedMutationId, tree?.id)
  const { mutationVersion } = useGetMutationVersion(selectedMutationId)

  // ToDo: merge mutationId, source, version to one state

  // ToDo: move to @mweb/react-engine
  const getMutationToBeLoaded = useCallback(async () => {
    if (!tree.id) throw new Error('No root context ID found')
    const favoriteMutation = await engine.mutationService.getFavoriteMutation(tree.id)
    const lastUsedMutation = tree ? await engine.mutationService.getLastUsedMutation(tree) : null

    return lastUsedMutation ?? favoriteMutation
  }, [engine, tree])

  const { mutation: selectedMutation, isMutationLoading: isSelectedMutationLoading } = useMutation(
    selectedMutationId,
    preferredSource,
    mutationVersion
  )

  useEffect(() => {
    // ToDo: move to @mweb/react-engine
    getMutationToBeLoaded().then((favoriteMutationId) => {
      // ToDo: move it to the separate useEffect ?
      if (defaultMutationId && favoriteMutationId && defaultMutationId !== favoriteMutationId) {
        engine.mutationService.getMutation(defaultMutationId).then((mutationToSwitch) => {
          if (mutationToSwitch) {
            modalApi.notify(
              mutationSwitched({
                fromMutationId: favoriteMutationId,
                toMutationId: defaultMutationId,
                onBack: () => setSelectedMutationId(favoriteMutationId),
              })
            )
          } else {
            modalApi.notify(
              mutationDisabled({
                onBack: () => setSelectedMutationId(favoriteMutationId),
              })
            )
          }
        })
      }

      setSelectedMutationId(defaultMutationId ?? favoriteMutationId)
    })
  }, [getMutationToBeLoaded, defaultMutationId, modalApi])

  const { mutationApps, isLoading: isMutationAppsLoading } = useMutationApps(
    selectedMutation?.id,
    selectedMutation?.apps ?? []
  )

  const activeApps = useMemo(
    () => mutationApps.filter((app) => app.settings.isEnabled),
    [mutationApps]
  )

  const { parserConfigs, isLoading: isMutationParsersLoading } = useMutationParsers(mutationApps)

  useEffect(() => {
    if (!tree) return

    updateRootContext({
      mutationId: selectedMutationId ?? null,
      gatewayId: config.gatewayId,
    })
  }, [selectedMutationId])

  useEffect(() => {
    if (!tree) return

    // Load parser configs for root context
    // ToDo: generalize for whole context tree
    for (const pc of parserConfigs) {
      const isSuitable = pc.targets.some((t) => utils.isTargetMet(t, tree))

      if (isSuitable) {
        attachParserConfig(pc)
      } else {
        detachParserConfig(pc.id)
      }
    }
  }, [parserConfigs, tree])

  const isLoading = isMutationAppsLoading || isMutationParsersLoading || isSelectedMutationLoading

  const state: MutableWebContextState = {
    config: nearConfig,
    engine,
    tree,
    activeApps,
    selectedMutation,
    selectedMutationId,
    isLoading,
    switchMutation: setSelectedMutationId,
  }

  return (
    <MutableWebContext.Provider value={state}>
      <>{children}</>
    </MutableWebContext.Provider>
  )
}

export { MutableWebProvider }
