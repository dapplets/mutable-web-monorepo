import { useQueries } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { IContextNode } from '@mweb/core'
import { useEffect } from 'react'

export const useMutationsLastUsage = (mutationIds: string[], context: IContextNode | null) => {
  const { engine } = useEngine()

  const queries = useQueries({
    queries: mutationIds.map((mutationId) => ({
      queryKey: ['mutationLastUsage', mutationId, context?.id],
      queryFn: () =>
        context
          ? engine.mutationService.getMutationLastUsage(mutationId, context)
          : Promise.resolve(null),
      initialData: null,
      enabled: !!context,
    })),
  })

  useEffect(() => {
    const sub = engine.eventService.on('mutationLastUsageChanged', (event) => {
      if (mutationIds.includes(event.mutationId)) {
        queries[mutationIds.indexOf(event.mutationId)].refetch()
      }
    })

    return () => sub.remove()
  }, [engine, queries, mutationIds])

  return queries
}
