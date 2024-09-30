import { AppInstanceWithSettings } from '../../services/application/application.entity'
import { MutationDto } from '../../services/mutation/dtos/mutation.dto'
import { Engine } from '../../../engine'
import { useQueryArray } from '../../hooks/use-query-array'

export const useMutationApps = (engine: Engine, mutation?: MutationDto | null) => {
  const { data, setData, isLoading, error } = useQueryArray<AppInstanceWithSettings>({
    query: async () => (mutation ? engine.applicationService.getAppsFromMutation(mutation) : []),
    deps: [engine, mutation],
  })

  return { mutationApps: data, setMutationApps: setData, isLoading, error }
}
