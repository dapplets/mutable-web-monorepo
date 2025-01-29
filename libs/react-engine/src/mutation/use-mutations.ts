import { utils } from '@mweb/backend'
import { IContextNode } from '@mweb/core'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useEngine } from '../engine'

/**
 * @param context core.tree context; if null returns all contexts
 */
export const useMutations = (context?: IContextNode | null) => {
  const { engine } = useEngine()

  // ToDo: invalidate cache, use useQueries?
  const { data, isLoading, error } = useQuery({
    queryKey: ['mutations'],
    queryFn: () => engine.mutationService.getMutationsForContext(null),
    initialData: [],
  })

  const filteredData = useMemo(
    () => (context ? data.filter((mut) => utils.isMutationMetContext(mut, context)) : data),
    [context, data]
  )

  return { mutations: filteredData, isLoading, error }
}
