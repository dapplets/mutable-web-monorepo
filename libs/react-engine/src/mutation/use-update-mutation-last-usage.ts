import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { MutationWithSettings } from '@mweb/backend'

export const useUpdateMutationLastUsage = () => {
  const { engine } = useEngine()

  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: ({ mutationId, hostname }: { mutationId: string; hostname: string }) =>
      engine.mutationService.updateMutationLastUsage(mutationId, hostname),
    onSuccess: (lastUsage, { mutationId }) => {
      queryClient.setQueryData(['mutations'], (prev: MutationWithSettings[]) =>
        prev.map((mut) =>
          mut.id === mutationId ? { ...mut, settings: { ...mut.settings, lastUsage } } : mut
        )
      )
    },
  })

  return { updateMutationLastUsage: mutate }
}
