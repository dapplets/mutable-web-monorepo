import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { EntitySourceType } from '@mweb/backend'

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

  const setPreferredSource = (mutationId: string, source: EntitySourceType | null) => {
    mutate({ mutationId, source })
  }

  return { setPreferredSource, isLoading: isPending, error }
}
