import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'

export const useGetSelectedMutation = (contextId: string | null | undefined) => {
  const { engine } = useEngine()

  const { data, isLoading, error } = useQuery({
    queryKey: ['selectedMutationId', contextId],
    queryFn: () =>
      contextId ? engine.mutationService.getSelectedMutation(contextId) : Promise.resolve(null),
  })

  return { selectedMutationId: data ?? null, isLoading, error }
}
