import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { MutationWithSettings } from '@mweb/backend'

export function useRemoveMutationFromRecents() {
  const queryClient = useQueryClient()
  const { engine } = useEngine()

  const { mutate, isPending, error } = useMutation({
    mutationFn: (mutationId: string) =>
      engine.mutationService.removeMutationFromRecents(mutationId),
    onSuccess: (_, mutationId) => {
      queryClient.setQueryData(['mutations'], (prev: MutationWithSettings[]) =>
        prev.map((mut) =>
          mut.id === mutationId ? { ...mut, settings: { ...mut.settings, lastUsage: null } } : mut
        )
      )
    },
  })

  return { removeMutationFromRecents: mutate, isLoading: isPending, error }
}
