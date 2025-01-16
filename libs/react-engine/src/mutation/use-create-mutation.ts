import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { MutationWithSettings, SaveMutationOptions } from '@mweb/backend'
import { MutationCreateDto } from '@mweb/backend'

export function useCreateMutation() {
  const queryClient = useQueryClient()
  const { engine } = useEngine()

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: ({
      creatingMutation,
      options,
    }: {
      creatingMutation: MutationCreateDto
      options?: SaveMutationOptions
    }) => engine.mutationService.createMutation(creatingMutation, options),
    onSuccess: (mutation) => {
      queryClient.setQueryData(['mutations'], (prev: MutationWithSettings[]) => [...prev, mutation])
    },
  })

  return {
    createMutation: (creatingMutation: MutationCreateDto, options?: SaveMutationOptions) =>
      mutateAsync({ creatingMutation, options }),
    isLoading: isPending,
    error,
  }
}
