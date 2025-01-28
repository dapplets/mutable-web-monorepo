import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { EntitySourceType } from '@mweb/backend'
import { useCallback } from 'react'

export function useSetPreferredSource() {
  const queryClient = useQueryClient()
  const { engine } = useEngine()

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({
      mutationId,
      contextId,
      source,
    }: {
      mutationId: string
      contextId: string
      source: EntitySourceType | null
    }) => engine.mutationService.setPreferredSource(mutationId, contextId, source),
    onSuccess: (_, { mutationId, contextId, source }) => {
      queryClient.setQueryData(['preferredSource', mutationId, contextId], source)
    },
  })

  const setPreferredSource = useCallback(
    (mutationId: string, contextId: string, source: EntitySourceType | null) => {
      mutate({ mutationId, contextId, source })
    },
    [mutate]
  )

  return { setPreferredSource, isLoading: isPending, error }
}
