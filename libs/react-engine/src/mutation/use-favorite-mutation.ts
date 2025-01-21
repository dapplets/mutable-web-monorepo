import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'

export const useFavoriteMutation = () => {
  const { engine } = useEngine()

  const { data, isLoading, error } = useQuery({
    queryKey: ['favoriteMutationId'],
    queryFn: () => engine.mutationService.getFavoriteMutation(),
    initialData: null,
  })

  return { favoriteMutationId: data, isLoading, error }
}
