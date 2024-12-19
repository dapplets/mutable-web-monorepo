import React, { FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MutableWebContext, MutableWebContextState } from './mutable-web-context'
import { Engine, EngineConfig, EntitySourceType } from '@mweb/backend'
import { useMutationApps } from './use-mutation-apps'
import { useMutationParsers } from './use-mutation-parsers'
import { useCore } from '@mweb/react'
import { useMutations } from './use-mutations'
import { useApplications } from './use-applications'
import { utils } from '@mweb/backend'
import { mutationDisabled, mutationSwitched } from './notifications'
import { getNearConfig } from '@mweb/backend'
import { ModalContextState } from '../modal-context/modal-context'
import { MutationDto } from '@mweb/backend'
import { ParserType, ParserConfig } from '@mweb/core'
import { useSelectedMutation } from './use-selected-mutation'

type Props = {
  config: EngineConfig
  defaultMutationId?: string | null
  modalApi: ModalContextState
  children: ReactNode
}

const MWebParserConfig: ParserConfig = {
  parserType: ParserType.MWeb,
  id: 'mweb',
}

const LinkParserConfig: ParserConfig = {
  parserType: ParserType.Link,
  id: 'engine', // ToDo: id used as namespace
}

const MutableWebProvider: FC<Props> = ({ config, defaultMutationId, modalApi, children }) => {
  const { tree, attachParserConfig, detachParserConfig, updateRootContext } = useCore()
  const engineRef = useRef<Engine | null>(null)

  if (!engineRef.current) {
    engineRef.current = new Engine(config)
    attachParserConfig(MWebParserConfig) // ToDo: move
    attachParserConfig(LinkParserConfig)

    console.log('[MutableWeb] Engine initialized', engineRef.current)
  }

  const nearConfig = useMemo(() => getNearConfig(config.networkId), [config.networkId])

  const engine = engineRef.current

  const { mutations, setMutations, isLoading: isMutationsLoading } = useMutations(engine)
  const { applications: allApps, isLoading: isAppsLoading } = useApplications(engine)

  const [selectedMutationId, setSelectedMutationId] = useState<string | null>(null)
  const [preferredSources, setPreferredSources] = useState<{
    [key: string]: EntitySourceType | null
  }>({})
  const [mutationVersions, setMutationVersions] = useState<{
    [key: string]: string | null
  }>({})
  const [favoriteMutationId, setFavoriteMutationId] = useState<string | null>(null)

  useEffect(() => {
    engine.mutationService.getFavoriteMutation().then((mutationId) => {
      setFavoriteMutationId(mutationId)
    })
  }, [engine])

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

  // const selectedMutation = useMemo(() => {
  //   if (!selectedMutationId) return null

  //   const [localMut, remoteMut] = mutations
  //     .filter((m) => m.id === selectedMutationId)
  //     .sort((a) => (a.source === EntitySourceType.Local ? -1 : 1))

  //   if (preferredSources[selectedMutationId] === EntitySourceType.Local) {
  //     return localMut ?? remoteMut ?? null
  //   } else if (preferredSources[selectedMutationId] === EntitySourceType.Origin) {
  //     return remoteMut ?? localMut ?? null
  //   } else {
  //     return localMut ?? remoteMut ?? null
  //   }
  // }, [mutations, selectedMutationId, preferredSources, mutationVersions])

  const { selectedMutation, isSelectedMutationLoading, setSelectedMutation } = useSelectedMutation(
    engine,
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

  const {
    mutationApps,
    setMutationApps,
    isLoading: isMutationAppsLoading,
  } = useMutationApps(engine, selectedMutation)

  const activeApps = useMemo(
    () => mutationApps.filter((app) => app.settings.isEnabled),
    [mutationApps]
  )

  const { parserConfigs, isLoading: isMutationParsersLoading } = useMutationParsers(
    engine,
    mutationApps
  )

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
        const lastUsage = await engine.mutationService.updateMutationLastUsage(
          mutationId,
          window.location.hostname
        )

        // Update last usage for selected mutation
        setMutations((prev) =>
          prev.map((mut) =>
            mut.id === mutationId ? { ...mut, settings: { ...mut.settings, lastUsage } } : mut
          )
        )
      }

      setSelectedMutationId(mutationId)
    },
    [selectedMutationId]
  )

  const refreshMutation = useCallback(async (mutation: MutationDto) => {
    const mutationWithSettings = await engine.mutationService.populateMutationWithSettings(mutation)

    setMutations((prev) => {
      const index = prev.findIndex(
        (m) => m.id === mutationWithSettings.id && m.source === mutationWithSettings.source
      )
      if (index === -1) {
        return [...prev, mutationWithSettings]
      } else {
        return prev.map((m, i) => (i === index ? mutationWithSettings : m))
      }
    })

    if (mutation.id === selectedMutationId) {
      switchPreferredSource(mutation.id, mutation.source)
      setSelectedMutation(mutationWithSettings)
    }
  }, [selectedMutationId])

  // ToDo: move to separate hook
  const setFavoriteMutation = useCallback(
    async (mutationId: string | null) => {
      try {
        setFavoriteMutationId(mutationId)
        await engine.mutationService.setFavoriteMutation(mutationId)
      } catch (err) {
        console.error(err)
      }
    },
    [engine]
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

  // ToDo: move to separate hook
  const removeMutationFromRecents = useCallback(
    async (mutationId: string) => {
      try {
        await engine.mutationService.removeMutationFromRecents(mutationId)

        setMutations((prev) =>
          prev.map((mut) =>
            mut.id === mutationId ? { ...mut, settings: { ...mut.settings, lastUsage: null } } : mut
          )
        )
      } catch (err) {
        console.error(err)
      }
    },
    [engine]
  )

  const isLoading =
    isMutationsLoading ||
    isAppsLoading ||
    isMutationAppsLoading ||
    isMutationParsersLoading ||
    isSelectedMutationLoading

  const state: MutableWebContextState = {
    config: nearConfig,
    engine,
    mutations,
    allApps,
    mutationApps,
    activeApps,
    selectedMutation,
    isLoading,
    switchMutation,
    switchPreferredSource,
    getPreferredSource,
    refreshMutation,
    setFavoriteMutation,
    removeMutationFromRecents,
    favoriteMutationId,
    setMutations,
    setMutationApps,
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
