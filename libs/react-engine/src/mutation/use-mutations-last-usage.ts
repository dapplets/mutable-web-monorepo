import { IContextNode } from '@mweb/core'
import { useQueries } from '@tanstack/react-query'
import { useEngine } from '../engine'

export const useMutationsLastUsage = (mutationIds: string[], context: IContextNode | null) => {
  const { engine } = useEngine()

  const queries = useQueries({
    queries: mutationIds.map((mutationId) => ({
      queryKey: ['mutationLastUsage', mutationId, context?.id],
      queryFn: () =>
        context
          ? engine.mutationService.getMutationLastUsage(mutationId, context)
          : Promise.resolve(null),
      enabled: !!context,
    })),
  })

  return queries
}
