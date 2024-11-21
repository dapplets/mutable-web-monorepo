import { Engine, EngineConfig, EntitySourceType, getNearConfig, utils } from '@mweb/backend'
import { ParserConfig, ParserType } from '@mweb/core'
import { useCore } from '@mweb/react'
import React, { FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ModalContextState } from '../modal-context/modal-context'
import { MutableWebContext, MutableWebContextState } from './mutable-web-context'
import { mutationDisabled, mutationSwitched } from './notifications'
import { useMutationApps } from './use-mutation-apps'
import { useMutationParsers } from './use-mutation-parsers'
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

  const [selectedMutationId, setSelectedMutationId] = useState<string | null>(null)
  const [preferredSource, setPreferredSource] = useState<EntitySourceType | null>(null)
  const [mutationVersion, setMutationVersion] = useState<string | null>(null)
  const [favoriteMutationId, setFavoriteMutationId] = useState<string | null>(null)

  useEffect(() => {
    engine.mutationService.getFavoriteMutation().then((mutationId) => {
      setFavoriteMutationId(mutationId)
    })
  }, [engine])

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

  const { selectedMutation, isSelectedMutationLoading, refreshSelectedMutation } =
    useSelectedMutation(
      engine,
      selectedMutationId,
      selectedMutationId ? preferredSource : undefined,
      selectedMutationId ? mutationVersion : undefined,
      (source) => setPreferredSource(source) // ToDo: workaround
    )

  useEffect(() => {
    const fn = async () => {
      const favoriteMutation = await engine.mutationService.getFavoriteMutation()
      const lastUsedMutation = tree ? await engine.mutationService.getLastUsedMutation(tree) : null
      const _favoriteMutationId = lastUsedMutation ?? favoriteMutation

      // ToDo: move it to the separate useEffect ?
      if (defaultMutationId && _favoriteMutationId && defaultMutationId !== _favoriteMutationId) {
        const hasMutation = !!(await engine.mutationService.getMutation(_favoriteMutationId)) // ToDo: redundant request

        if (hasMutation) {
          modalApi.notify(
            mutationSwitched({
              fromMutationId: _favoriteMutationId,
              toMutationId: defaultMutationId,
              onBack: () => switchMutation(_favoriteMutationId),
            })
          )
        } else {
          modalApi.notify(
            mutationDisabled({
              onBack: () => switchMutation(_favoriteMutationId),
            })
          )
        }
      }

      switchMutation(defaultMutationId ?? _favoriteMutationId)
    }

    fn()
  }, [engine, tree, defaultMutationId, modalApi])

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
        const preferredSource = await engine.mutationService.getPreferredSource(mutationId)
        const mutationVersion = await engine.mutationService.getMutationVersion(mutationId)

        setPreferredSource(preferredSource)
        setMutationVersion(mutationVersion)
      } else {
        setPreferredSource(null)
        setMutationVersion(null)
      }

      setSelectedMutationId(mutationId)
    },
    [selectedMutationId]
  )

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
    async (source: EntitySourceType | null) => {
      if (!selectedMutationId) return
      try {
        setPreferredSource(source)
        await engine.mutationService.setPreferredSource(selectedMutationId, source)
      } catch (err) {
        console.error(err)
      }
    },
    [engine, selectedMutationId]
  )

  // ToDo: move to separate hook
  const switchMutationVersion = useCallback(
    async (version: string | null) => {
      try {
        if (!selectedMutationId) return
        setMutationVersion(version)
        await engine.mutationService.setMutationVersion(selectedMutationId, version)
      } catch (err) {
        console.error(err)
      }
    },
    [engine, selectedMutationId]
  )

  const isLoading = isMutationAppsLoading || isMutationParsersLoading || isSelectedMutationLoading

  const state: MutableWebContextState = {
    config: nearConfig,
    engine,
    mutationApps,
    activeApps,
    selectedMutation,
    isLoading,
    switchMutation,
    switchPreferredSource,
    refreshSelectedMutation,
    setFavoriteMutation,
    favoriteMutationId,
    setMutationApps,
    switchMutationVersion,
    preferredSource,
    mutationVersion,
  }

  return (
    <MutableWebContext.Provider value={state}>
      <>{children}</>
    </MutableWebContext.Provider>
  )
}

export { MutableWebProvider }
