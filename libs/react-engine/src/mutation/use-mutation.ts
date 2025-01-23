import { EntityId, EntitySourceType, MutationDto } from '@mweb/backend'
import { useEngine } from '../engine'
import { useQuery } from '@tanstack/react-query'

export const useMutation = (
  mutationId: EntityId | undefined | null,
  source?: EntitySourceType | null,
  version?: string | null
) => {
  const { engine } = useEngine()

  const {
    data: mutation,
    isLoading: isMutationLoading,
    error: mutationError,
  } = useQuery<MutationDto | null>({
    queryKey: ['mutation', { mutationId, source, version }], // ToDo: where cache invalidates?
    queryFn: () =>
      mutationId
        ? engine.mutationService.getMutation(mutationId, source ?? undefined, version ?? undefined)
        : Promise.resolve(null),
    enabled: !!mutationId,
    initialData: null,
  })

  return { mutation, isMutationLoading, mutationError }
}
