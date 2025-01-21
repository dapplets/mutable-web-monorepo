import { EngineConfig, EntitySourceType, getNearConfig, utils } from '@mweb/backend'
import { useCore } from '@mweb/react'
import {
  useEngine,
  useMutationApps,
  useMutationParsers,
  useMutations,
  useMutationWithSettings,
  useUpdateMutationLastUsage,
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

  const { mutations, isLoading: isMutationsLoading } = useMutations(tree)

  const { updateMutationLastUsage } = useUpdateMutationLastUsage()

  const [selectedMutationId, setSelectedMutationId] = useState<string | null>(null)
  const [preferredSources, setPreferredSources] = useState<{
    [key: string]: EntitySourceType | null
  }>({})
  const [mutationVersions, setMutationVersions] = useState<{
    [key: string]: string | null
  }>({})

  useEffect(() => {
    const fn = async () => {
      const localMutations = mutations.filter((mut) => mut.source === EntitySourceType.Local)
      const newPreferredSources: { [key: string]: EntitySourceType | null } = {}
      const newMutationVersions: { [key: string]: string | null } = {}

      await Promise.all([
        ...localMutations.map((mut) =>
          engine.mutationService
            .getPreferredSource(mut.id)
            .then((source) => (newPreferredSources[mut.id] = source))
        ),
        ...mutations.map((mut) =>
          engine.mutationService
            .getMutationVersion(mut.id)
            .then((version) => (newMutationVersions[mut.id] = version))
        ),
      ])

      setPreferredSources(newPreferredSources)
      setMutationVersions(newMutationVersions)
    }
    fn()
  }, [engine, mutations])

  const getMutationToBeLoaded = useCallback(async () => {
    const favoriteMutation = await engine.mutationService.getFavoriteMutation()
    const lastUsedMutation = tree ? await engine.mutationService.getLastUsedMutation(tree) : null

    return lastUsedMutation ?? favoriteMutation
  }, [engine, tree])

  const { selectedMutation, isSelectedMutationLoading } = useMutationWithSettings(
    selectedMutationId,
    selectedMutationId ? preferredSources[selectedMutationId] : undefined,
    selectedMutationId ? mutationVersions[selectedMutationId] : undefined
  )

  useEffect(() => {
    getMutationToBeLoaded().then((favoriteMutationId) => {
      // ToDo: move it to the separate useEffect ?
      if (defaultMutationId && favoriteMutationId && defaultMutationId !== favoriteMutationId) {
        const hasMutation = mutations.some((mutation) => mutation.id === defaultMutationId)

        if (hasMutation) {
          modalApi.notify(
            mutationSwitched({
              fromMutationId: favoriteMutationId,
              toMutationId: defaultMutationId,
              onBack: () => switchMutation(favoriteMutationId),
            })
          )
        } else {
          modalApi.notify(
            mutationDisabled({
              onBack: () => switchMutation(favoriteMutationId),
            })
          )
        }
      }

      switchMutation(defaultMutationId ?? favoriteMutationId)
    })
  }, [getMutationToBeLoaded, defaultMutationId, modalApi])

  const { mutationApps, isLoading: isMutationAppsLoading } = useMutationApps(selectedMutation)

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
    for (const parser of parserConfigs) {
      const isSuitableParser = parser.targets.some((target) => utils.isTargetMet(target, tree))

      if (isSuitableParser) {
        attachParserConfig(parser)
      }
    }

    return () => {
      for (const parser of parserConfigs) {
        detachParserConfig(parser.id)
      }
    }
  }, [parserConfigs, tree])

  // ToDo: move to separate hook
  const switchMutation = useCallback(
    async (mutationId: string | null) => {
      if (selectedMutationId === mutationId) return

      if (mutationId) {
        updateMutationLastUsage({ mutationId: mutationId, hostname: window.location.hostname })
      }

      setSelectedMutationId(mutationId)
    },
    [selectedMutationId]
  )

  // ToDo: move to separate hook
  const switchPreferredSource = useCallback(
    async (mutationId: string, source: EntitySourceType | null) => {
      try {
        const mut = mutations.find(
          (m) => m.id === mutationId && m.source === EntitySourceType.Local
        )
        if (!mut) return
        setPreferredSources((oldPrefferedSources) => ({
          ...oldPrefferedSources,
          [mutationId]: source,
        }))
        await engine.mutationService.setPreferredSource(mutationId, source)
      } catch (err) {
        console.error(err)
      }
    },
    [engine, mutations]
  )

  // ToDo: move to separate hook
  const switchMutationVersion = useCallback(
    async (mutationId: string, version?: string | null) => {
      try {
        const mut = mutations.find((m) => m.id === mutationId)
        if (!mut) return
        setMutationVersions((oldMutationVersions) => ({
          ...oldMutationVersions,
          [mutationId]: version ?? null,
        }))
        await engine.mutationService.setMutationVersion(mutationId, version)
      } catch (err) {
        console.error(err)
      }
    },
    [engine, mutations]
  )

  const getPreferredSource = (mutationId: string): EntitySourceType | null =>
    preferredSources[mutationId]

  const isLoading =
    isMutationsLoading ||
    isMutationAppsLoading ||
    isMutationParsersLoading ||
    isSelectedMutationLoading

  const state: MutableWebContextState = {
    config: nearConfig,
    engine,
    tree,
    mutations,
    mutationApps,
    activeApps,
    selectedMutation,
    isLoading,
    switchMutation,
    switchPreferredSource,
    getPreferredSource,
    switchMutationVersion,
    mutationVersions,
  }

  return (
    <MutableWebContext.Provider value={state}>
      <>{children}</>
    </MutableWebContext.Provider>
  )
}

export { MutableWebProvider }
