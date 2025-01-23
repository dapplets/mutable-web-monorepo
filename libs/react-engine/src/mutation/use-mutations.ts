import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { IContextNode } from '@mweb/core'
import { utils } from '@mweb/backend'
import { useMemo } from 'react'

/**
 * @param context core.tree context; if null returns all contexts
 */
export const useMutations = (context?: IContextNode | null) => {
  const { engine } = useEngine()

  const { data, isLoading, error } = useQuery({
    queryKey: ['mutations'],
    queryFn: () => engine.mutationService.getMutationsForContext(null),
    initialData: [],
  })

  const filteredData = useMemo(
    () => (context ? data.filter((mut) => utils.isMutationMetContext(mut, context)) : data),
    [context]
  )

  return { mutations: filteredData, isLoading, error }
}
