import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'

export const useGetMutationVersion = (mutationId: string | null) => {
  const { engine } = useEngine()

  const { data, isLoading, error } = useQuery({
    queryKey: ['selectedMutationVersion', mutationId],
    queryFn: () =>
      mutationId ? engine.mutationService.getMutationVersion(mutationId) : Promise.resolve(null),
    initialData: null,
  })

  return { mutationVersion: data, isLoading, error }
}
