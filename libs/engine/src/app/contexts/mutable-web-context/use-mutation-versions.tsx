import { useMutableWeb } from './use-mutable-web'
import { useQuery } from '../../hooks/use-query'

export const useMutationVersions = (mutationId: string | null) => {
  const { engine } = useMutableWeb()

  const {
    data: mutationVersions,
    isLoading: areMutationVersionsLoading,
    // error,
  } = useQuery<{ version: string }[]>({
    query: () =>
      mutationId ? engine.mutationService.getMutationVersions(mutationId) : Promise.resolve([]),
    deps: [engine, mutationId],
    initialData: [],
  })

  return {
    mutationVersions,
    areMutationVersionsLoading,
  }
}
