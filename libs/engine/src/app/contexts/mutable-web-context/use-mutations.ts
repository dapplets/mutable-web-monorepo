import { useCore } from '@mweb/react'
import { MutationWithSettings } from '../../services/mutation/mutation.entity'
import { Engine } from '../../../engine'
import { useQueryArray } from '../../hooks/use-query-array'

export const useMutations = (engine: Engine) => {
  const { core } = useCore()

  const { data, setData, isLoading, error } = useQueryArray<MutationWithSettings>({
    query: () => engine.mutationService.getMutationsWithSettings(core.tree),
    deps: [engine, core],
  })

  return { mutations: data, setMutations: setData, isLoading, error }
}
