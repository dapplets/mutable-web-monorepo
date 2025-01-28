import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { IContextNode } from '@mweb/core'
import { utils } from '@mweb/backend'
import { useEffect, useMemo } from 'react'

/**
 * @param context core.tree context; if null returns all contexts
 */
export const useMutations = (context?: IContextNode | null) => {
  const { engine } = useEngine()

  // ToDo: invalidate cache, use useQueries?
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['mutations'],
    queryFn: () => engine.mutationService.getMutationsForContext(null),
    initialData: [],
  })

  const filteredData = useMemo(
    () => (context ? data.filter((mut) => utils.isMutationMetContext(mut, context)) : data),
    [context, data]
  )

  useEffect(() => {
    // ToDo: too naive
    const subs = [
      engine.eventService.on('mutationCreated', () => {
        refetch()
      }),
      engine.eventService.on('mutationEdited', () => {
        refetch()
      }),
      engine.eventService.on('mutationSaved', () => {
        refetch()
      }),
      engine.eventService.on('mutationDeleted', () => {
        refetch()
      }),
    ]

    return () => subs.forEach((sub) => sub.remove())
  }, [engine])

  return { mutations: filteredData, isLoading, error }
}
