import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { IContextNode } from '@mweb/core'

export function useRemoveMutationFromRecents() {
  const queryClient = useQueryClient()
  const { engine } = useEngine()

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({ mutationId, context }: { mutationId: string; context: IContextNode }) =>
      engine.mutationService.removeMutationFromRecents(mutationId, context),
    onSuccess: (_, { mutationId, context }) => {
      queryClient.setQueryData(['mutationLastUsage', mutationId, context.id], null)
    },
  })

  return { removeMutationFromRecents: mutate, isLoading: isPending, error }
}
