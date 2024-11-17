import { Engine, EntitySourceType, MutationDto, MutationWithSettings } from '@mweb/backend'
import { useCallback } from 'react'
import { useQuery } from '../../hooks/use-query'

export const useSelectedMutation = (
  engine: Engine,
  mutationId: string | null,
  source?: EntitySourceType | null,
  version?: string | null,
  onSourceChange?: (source: EntitySourceType | null) => void
) => {
  const fetch = useCallback(async () => {
    if (!mutationId) return Promise.resolve(null)

    // Update last usage before fetching
    await engine.mutationService.updateMutationLastUsage(mutationId, window.location.hostname)

    return engine.mutationService.getMutationWithSettings(
      mutationId,
      source ?? undefined,
      version ?? undefined
    )
  }, [engine, mutationId, source, version])

  const {
    data: selectedMutation,
    isLoading: isSelectedMutationLoading,
    error: selectedMutationError,
    setData: setMutation,
  } = useQuery<MutationWithSettings | null>({
    query: fetch,
    deps: [mutationId, source, version],
    initialData: null,
  })

  const refreshSelectedMutation = useCallback(
    async (mutation: MutationDto) => {
      if (!selectedMutation) return

      if (selectedMutation.id === mutation.id && selectedMutation.source === mutation.source) {
        const mutationWithSettings =
          await engine.mutationService.populateMutationWithSettings(mutation)
        setMutation(mutationWithSettings)

        onSourceChange?.(mutation.source)
      }
    },
    [selectedMutation]
  )

  return {
    selectedMutation,
    isSelectedMutationLoading,
    selectedMutationError,
    refreshSelectedMutation,
  }
}
