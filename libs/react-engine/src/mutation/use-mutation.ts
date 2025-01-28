import { EntityId, EntitySourceType, MutationDto } from '@mweb/backend'
import { useEngine } from '../engine'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

export const useMutation = (
  mutationId: EntityId | undefined | null,
  source?: EntitySourceType | null,
  version?: string | null
) => {
  const queryClient = useQueryClient()
  const { engine } = useEngine()

  const {
    data: mutation,
    isLoading: isMutationLoading,
    error: mutationError,
    refetch,
  } = useQuery<MutationDto | null>({
    queryKey: ['mutation', { mutationId, source, version }], // ToDo: where cache invalidates?
    queryFn: () =>
      mutationId
        ? engine.mutationService.getMutation(mutationId, source ?? undefined, version ?? undefined)
        : Promise.resolve(null),
    enabled: !!mutationId,
    initialData: null,
  })

  useEffect(() => {
    const subs = [
      engine.eventService.on('mutationEdited', (event) => {
        if (event.mutationId === mutationId) refetch()
      }),
      engine.eventService.on('mutationSaved', (event) => {
        if (event.mutationId === mutationId) refetch()
      }),
    ]

    return () => subs.forEach((sub) => sub.remove())
  }, [engine, mutationId])

  // ToDo: is it ok?
  useEffect(() => {
    if (!mutation) return

    queryClient.invalidateQueries({
      queryKey: ['mutationApps', { mutationId: mutation.id }],
    })
  }, [mutation, queryClient])

  return { mutation, isMutationLoading, mutationError }
}
