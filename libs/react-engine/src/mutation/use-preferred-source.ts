import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'

export const usePreferredSource = (mutationId: string | null) => {
  const { engine } = useEngine()

  const { data, isLoading, error } = useQuery({
    queryKey: ['preferredSource', mutationId],
    queryFn: () =>
      mutationId ? engine.mutationService.getPreferredSource(mutationId) : Promise.resolve(null),
    initialData: null,
  })

  return { preferredSource: data, isLoading, error }
}
