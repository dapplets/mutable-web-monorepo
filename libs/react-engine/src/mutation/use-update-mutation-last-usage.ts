import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { IContextNode } from '@mweb/core'

export const useUpdateMutationLastUsage = () => {
  const { engine } = useEngine()

  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: ({ mutationId, context }: { mutationId: string; context: IContextNode }) =>
      engine.mutationService.updateMutationLastUsage(mutationId, context),
    onSuccess: (lastUsage, { mutationId, context }) => {
      queryClient.setQueryData(['mutationLastUsage', mutationId, context.id], lastUsage)
    },
  })

  return { updateMutationLastUsage: mutate }
}
