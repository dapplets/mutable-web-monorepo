import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { EntitySourceType } from '@mweb/backend'
import { useCallback } from 'react'

export function useSetPreferredSource() {
  const queryClient = useQueryClient()
  const { engine } = useEngine()

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({ mutationId, source }: { mutationId: string; source: EntitySourceType | null }) =>
      engine.mutationService.setPreferredSource(mutationId, source),
    onSuccess: (_, { mutationId, source }) => {
      queryClient.setQueryData(['preferredSource', mutationId], source)
    },
  })

  const setPreferredSource = useCallback(
    (mutationId: string, source: EntitySourceType | null) => {
      mutate({ mutationId, source })
    },
    [mutate]
  )

  return { setPreferredSource, isLoading: isPending, error }
}
