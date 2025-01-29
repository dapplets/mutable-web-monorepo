import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'

export const usePreferredSource = (
  mutationId: string | null,
  contextId: string | null | undefined
) => {
  const { engine } = useEngine()

  const { data, isLoading, error } = useQuery({
    queryKey: ['preferredSource', mutationId, contextId],
    queryFn: () =>
      mutationId && contextId
        ? engine.mutationService.getPreferredSource(mutationId, contextId)
        : Promise.resolve(null),
    initialData: null,
  })

  return { preferredSource: data, isLoading, error }
}
