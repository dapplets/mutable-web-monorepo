import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { MutationDto, MutationCreateDto, SaveMutationOptions } from '@mweb/backend'

export function useSaveMutation() {
  const queryClient = useQueryClient()
  const { engine } = useEngine()

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: ({
      savingMutation,
      options,
    }: {
      savingMutation: MutationDto | MutationCreateDto
      options?: SaveMutationOptions
    }) => engine.mutationService.saveMutation(savingMutation, options),
    onSuccess: (savedMutation) => {
      queryClient.setQueryData(['mutations'], (prev: MutationDto[]) => {
        if (!prev) return undefined

        const mutationExists = prev.some(
          (mut) => mut.id === savedMutation.id && mut.source === savedMutation.source
        )

        if (mutationExists) {
          return prev.map((mut) =>
            mut.id === savedMutation.id && mut.source === savedMutation.source ? savedMutation : mut
          )
        } else {
          return [...prev, savedMutation]
        }
      })
    },
  })

  return {
    saveMutation: (
      savingMutation: MutationDto | MutationCreateDto,
      options?: SaveMutationOptions
    ) =>
      mutateAsync({
        savingMutation,
        options,
      }),
    isLoading: isPending,
    error,
  }
}
