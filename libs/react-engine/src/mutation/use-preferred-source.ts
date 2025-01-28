import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { useEffect } from 'react'

export const usePreferredSource = (mutationId: string | null, contextId: string | null | undefined) => {
  const { engine } = useEngine()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['preferredSource', mutationId, contextId],
    queryFn: () =>
      mutationId && contextId
        ? engine.mutationService.getPreferredSource(mutationId, contextId)
        : Promise.resolve(null),
    initialData: null,
  })

  useEffect(() => {
    const sub = engine.eventService.on('preferredSourceChanged', (event) => {
      if (event.mutationId === mutationId && event.contextId === contextId) {
        refetch()
      }
    })

    return () => sub.remove()
  }, [engine, mutationId, refetch])

  return { preferredSource: data, isLoading, error }
}
