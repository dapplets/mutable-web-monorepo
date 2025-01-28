import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { useEffect } from 'react'

export const useGetMutationVersion = (mutationId: string | null) => {
  const { engine } = useEngine()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['selectedMutationVersion', mutationId],
    queryFn: () =>
      mutationId ? engine.mutationService.getMutationVersion(mutationId) : Promise.resolve(null),
    initialData: null,
  })

  useEffect(() => {
    const sub = engine.eventService.on('mutationVersionChanged', (event) => {
      if (event.mutationId === mutationId) {
        refetch()
      }
    })

    return () => sub.remove()
  }, [engine, mutationId, refetch])

  return { mutationVersion: data, isLoading, error }
}
