import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'

export const useMutationVersions = (mutationId: string | null) => {
  const { engine } = useEngine()

  // ToDo: update when new version is added
  const { data: mutationVersions, isLoading: areMutationVersionsLoading } = useQuery({
    queryKey: ['mutationVersions', mutationId],
    queryFn: () =>
      mutationId ? engine.mutationService.getMutationVersions(mutationId) : Promise.resolve([]),
    initialData: [],
  })

  return {
    mutationVersions,
    areMutationVersionsLoading,
  }
}
