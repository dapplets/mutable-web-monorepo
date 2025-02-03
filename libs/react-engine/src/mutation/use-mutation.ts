import { EntityId, EntitySourceType, MutationDto } from '@mweb/backend'
import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'

export const useMutation = (
  mutationId: EntityId | null = null,
  source: EntitySourceType | null = null,
  version: string | null = null
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
  })

  return { mutation: mutation ?? null, isMutationLoading, mutationError }
}
