import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { MutationDto, SaveMutationOptions } from '@mweb/backend'

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
      queryClient.setQueryData(['mutations'], (prev: MutationDto[]) =>
        prev
          ? prev.map((mut) =>
              mut.id === editedMutation.id && mut.source === editedMutation.source
                ? editedMutation
                : mut
            )
          : undefined
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
