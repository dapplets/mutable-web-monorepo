import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { useCallback } from 'react'

export function useSetFavoriteMutation() {
  const queryClient = useQueryClient()
  const { engine } = useEngine()

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({ contextId, mutationId }: { contextId: string; mutationId: string | null }) =>
      engine.mutationService.setFavoriteMutation(contextId, mutationId),
    onSuccess: (_, { mutationId, contextId }) => {
      queryClient.setQueryData(['favoriteMutationId', contextId], mutationId)
    },
  })

  const setFavoriteMutation = useCallback(
    (contextId: string, mutationId: string | null) => {
      mutate({ contextId, mutationId })
    },
    [mutate]
  )

  return { setFavoriteMutation, isLoading: isPending, error }
}
