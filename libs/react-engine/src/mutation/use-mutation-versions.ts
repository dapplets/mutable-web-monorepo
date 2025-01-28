import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { useEffect } from 'react'

export const useMutationVersions = (mutationId: string | null) => {
  const { engine } = useEngine()

  // ToDo: update when new version is added
  const {
    data: mutationVersions,
    isLoading: areMutationVersionsLoading,
    refetch,
  } = useQuery({
    queryKey: ['mutationVersions', mutationId],
    queryFn: () =>
      mutationId ? engine.mutationService.getMutationVersions(mutationId) : Promise.resolve([]),
    initialData: [],
  })

  useEffect(() => {
    const sub = engine.eventService.on('mutationVersionChanged', (event) => {
      if (event.mutationId === mutationId) {
        refetch()
      }
    })

    return () => sub.remove()
  }, [engine, mutationId, refetch])

  return {
    mutationVersions,
    areMutationVersionsLoading,
  }
}
