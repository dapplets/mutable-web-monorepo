import { AppMetadata } from '../../services/application/application.entity'
import { Engine } from '../../../engine'
import { useQueryArray } from '../../hooks/use-query-array'

export const useApplications = (engine: Engine) => {
  const { data, isLoading, error } = useQueryArray<AppMetadata>({
    query: () => engine.applicationService.getApplications(),
    deps: [engine],
  })

  return { applications: data, isLoading, error }
}
