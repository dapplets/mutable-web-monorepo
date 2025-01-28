import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { useEffect } from 'react'

export const useFavoriteMutation = (contextId: string | null | undefined) => {
  const { engine } = useEngine()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['favoriteMutationId', contextId],
    queryFn: () =>
      contextId ? engine.mutationService.getFavoriteMutation(contextId) : Promise.resolve(null),
    initialData: null,
  })

  useEffect(() => {
    const sub = engine.eventService.on('favoriteMutationChanged', (event) => {
      if (event.contextId === contextId) {
        refetch()
      }
    })

    return () => sub.remove()
  }, [engine, contextId, refetch])

  return { favoriteMutationId: data, isLoading, error }
}
