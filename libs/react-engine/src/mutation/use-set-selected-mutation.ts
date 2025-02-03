import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { useCallback } from 'react'

export function useSetSelectedMutation() {
  const queryClient = useQueryClient()
  const { engine } = useEngine()

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({ contextId, mutationId }: { contextId: string; mutationId: string | null }) =>
      engine.mutationService.setSelectedMutation(contextId, mutationId),
    onSuccess: (_, { mutationId, contextId }) => {
      queryClient.setQueryData(['selectedMutationId', contextId], mutationId)
    },
  })

  const setSelectedMutationId = useCallback(
    (contextId: string, mutationId: string | null) => {
      mutate({ contextId, mutationId })
    },
    [mutate]
  )

  return { setSelectedMutationId, isLoading: isPending, error }
}
