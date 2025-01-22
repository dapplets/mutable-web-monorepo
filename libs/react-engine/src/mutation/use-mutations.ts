import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { IContextNode } from '@mweb/core'

/**
 * @param context core.tree context
 */
export const useMutations = (context: IContextNode | null) => {
  const { engine } = useEngine()

  const { data, isLoading, error } = useQuery({
    queryKey: ['mutations', { isContext: !!context }], // ToDo: add context id to the key?
    queryFn: () => engine.mutationService.getMutationsWithSettings(context),
    initialData: [],
  })

  return { mutations: data, isLoading, error }
}
