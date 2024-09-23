import { AppInstanceWithSettings } from '../../services/application/application.entity'
import { Mutation } from '../../services/mutation/mutation.entity'
import { Engine } from '../../../engine'
import { useQueryArray } from '../../hooks/use-query-array'

export const useMutationApps = (engine: Engine, mutation?: Mutation | null) => {
  const { data, setData, isLoading, error } = useQueryArray<AppInstanceWithSettings>({
    query: async () => (mutation ? engine.applicationService.getAppsFromMutation(mutation) : []),
    deps: [engine, mutation],
  })

  return { mutationApps: data, setMutationApps: setData, isLoading, error }
}
