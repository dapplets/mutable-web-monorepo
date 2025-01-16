import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { EntityId, EntitySourceType } from '@mweb/backend'

export function useDeleteLocalMutation() {
  const queryClient = useQueryClient()
  const { engine } = useEngine()

  const { mutate, isPending, error } = useMutation({
    mutationFn: (mutationId: EntityId) => engine.mutationService.deleteMutation(mutationId),
    onSuccess: (_, mutationId: EntityId) => {
      queryClient.setQueryData(['mutations'], (prev: any[]) =>
        prev.filter(
          (mutation) => !(mutation.id === mutationId && mutation.source === EntitySourceType.Local)
        )
      )
    },
  })

  return { deleteLocalMutation: mutate, isLoading: isPending, error }
}
