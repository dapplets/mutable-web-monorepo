import { useQuery } from '../../hooks/use-query'
import { Engine, EntitySourceType, MutationWithSettings } from '@mweb/backend'

export const useSelectedMutation = (
  engine: Engine,
  mutationId: string | null,
  source?: EntitySourceType | null,
  version?: string | null
) => {
  const {
    data: selectedMutation,
    isLoading: isSelectedMutationLoading,
    error: selectedMutationError,
    setData: setSelectedMutation,
  } = useQuery<MutationWithSettings | null>({
    query: () =>
      mutationId
        ? engine.mutationService.getMutationWithSettings(
            mutationId,
            source ?? undefined,
            version ?? undefined
          )
        : Promise.resolve(null),
    deps: [mutationId, source, version],
    initialData: null,
  })

  return { selectedMutation, isSelectedMutationLoading, selectedMutationError, setSelectedMutation }
}
