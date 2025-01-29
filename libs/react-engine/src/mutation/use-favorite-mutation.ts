import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'

export const useFavoriteMutation = (contextId: string | null | undefined) => {
  const { engine } = useEngine()

  const { data, isLoading, error } = useQuery({
    queryKey: ['favoriteMutationId', contextId],
    queryFn: () =>
      contextId ? engine.mutationService.getFavoriteMutation(contextId) : Promise.resolve(null),
    initialData: null,
  })

  return { favoriteMutationId: data, isLoading, error }
}
