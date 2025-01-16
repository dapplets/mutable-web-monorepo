import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { MutationDto, MutationWithSettings, SaveMutationOptions } from '@mweb/backend'

export function useEditMutation() {
  const queryClient = useQueryClient()
  const { engine } = useEngine()

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: ({
      editingMutation,
      options,
    }: {
      editingMutation: MutationDto
      options?: SaveMutationOptions
    }) => engine.mutationService.editMutation(editingMutation, options),
    onSuccess: (editedMutation) => {
      queryClient.setQueryData(['mutations'], (prev: MutationWithSettings[]) =>
        prev.map((mut) =>
          mut.id === editedMutation.id && mut.source === editedMutation.source
            ? editedMutation
            : mut
        )
      )
    },
  })

  return {
    editMutation: (editingMutation: MutationDto, options?: SaveMutationOptions) =>
      mutateAsync({ editingMutation, options }),
    isLoading: isPending,
    error,
  }
}
