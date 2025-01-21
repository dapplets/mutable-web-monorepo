import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEngine } from '../engine'

export function useSetFavoriteMutation() {
  const queryClient = useQueryClient()
  const { engine } = useEngine()

  const { mutate, isPending, error } = useMutation({
    mutationFn: (mutationId: string | null) =>
      engine.mutationService.setFavoriteMutation(mutationId),
    onSuccess: (_, mutationId) => {
      queryClient.setQueryData(['favoriteMutationId'], mutationId)
    },
  })

  return { setFavoriteMutation: mutate, isLoading: isPending, error }
}
