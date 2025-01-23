import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { useCallback } from 'react'

export function useSetMutationVersion() {
  const queryClient = useQueryClient()
  const { engine } = useEngine()

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({ mutationId, version }: { mutationId: string; version?: string | null }) =>
      engine.mutationService.setMutationVersion(mutationId, version),
    onSuccess: (_, { mutationId, version }) => {
      queryClient.setQueryData(['selectedMutationVersion', mutationId], version)
    },
  })

  const setMutationVersion = useCallback(
    (mutationId: string, version: string | null = null) => {
      mutate({ mutationId, version })
    },
    [mutate]
  )

  return { setMutationVersion, isLoading: isPending, error }
}
