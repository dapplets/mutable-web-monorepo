import { EngineConfig, getNearConfig, utils } from '@mweb/backend'
import { useCore } from '@mweb/react'
import {
  useEngine,
  useGetMutationVersion,
  useGetSelectedMutation,
  useMutation,
  useMutationApps,
  useMutationParsers,
  usePreferredSource,
  useSetSelectedMutation,
} from '@mweb/react-engine'
import React, { FC, ReactNode, useEffect, useMemo, useRef } from 'react'
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

  const { selectedMutationId, isLoading: isSelectedMutIdLoading } = useGetSelectedMutation(tree.id)
  const { preferredSource } = usePreferredSource(selectedMutationId, tree.id)
  const { mutationVersion } = useGetMutationVersion(selectedMutationId)

  const { setSelectedMutationId } = useSetSelectedMutation()

  // ToDo: merge mutationId, source, version to one state

  const { mutation: selectedMutation, isMutationLoading: isSelectedMutationLoading } = useMutation(
    selectedMutationId,
    preferredSource,
    mutationVersion
  )

  const defaultMutationProcessingRef = useRef(false)

  // defaultMutationId is used for augm.link
  // example url: https://augm.link/mutate/?t=https%3A%2F%2Ftwitter.com%2FMrConCreator&m=bos.dapplets.testnet%2Fmutation%2FZoo
  useEffect(() => {
    if (defaultMutationProcessingRef.current) return

    const contextId = tree.id
    if (!contextId) throw new Error('No root context ID found')

    if (defaultMutationId && selectedMutationId && defaultMutationId !== selectedMutationId) {
      engine.mutationService.getMutation(defaultMutationId).then((mutationToSwitch) => {
        defaultMutationProcessingRef.current = true

        setSelectedMutationId(contextId, defaultMutationId)

        if (mutationToSwitch) {
          modalApi.notify(
            mutationSwitched({
              fromMutationId: selectedMutationId,
              toMutationId: defaultMutationId,
              onBack: () => setSelectedMutationId(contextId, selectedMutationId),
            })
          )
        } else {
          modalApi.notify(
            mutationDisabled({
              onBack: () => setSelectedMutationId(contextId, selectedMutationId),
            })
          )
        }
      })
    }
  }, [selectedMutationId, defaultMutationId, modalApi, setSelectedMutationId, tree])

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

  const isEngineLoading =
    isSelectedMutIdLoading ||
    isMutationAppsLoading ||
    isMutationParsersLoading ||
    isSelectedMutationLoading

  const state: MutableWebContextState = {
    config: nearConfig,
    engine,
    tree,
    activeApps,
    selectedMutation,
    selectedMutationId,
    isEngineLoading,
  }

  return (
    <MutableWebContext.Provider value={state}>
      <>{children}</>
    </MutableWebContext.Provider>
  )
}

export { MutableWebProvider }
