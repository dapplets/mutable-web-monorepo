import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { MutationWithSettings, EntitySourceType } from '@mweb/backend'

export const useMutationWithSettings = (
  mutationId: string | null,
  source?: EntitySourceType | null,
  version?: string | null
) => {
  const { engine } = useEngine()

  const {
    data: selectedMutation,
    isLoading: isSelectedMutationLoading,
    error: selectedMutationError,
  } = useQuery<MutationWithSettings | null>({
    queryKey: ['mutation', { mutationId, source, version }], // ToDo: where cache invalidates?
    queryFn: () =>
      mutationId
        ? engine.mutationService.getMutationWithSettings(
            mutationId,
            source ?? undefined,
            version ?? undefined
          )
        : Promise.resolve(null),
    enabled: !!mutationId,
    initialData: null,
  })

  return { selectedMutation, isSelectedMutationLoading, selectedMutationError }
}
