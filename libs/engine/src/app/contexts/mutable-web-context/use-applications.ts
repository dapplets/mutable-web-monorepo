import { ApplicationDto } from '@mweb/backend'
import { Engine } from '@mweb/backend'
import { useQueryArray } from '../../hooks/use-query-array'

export const useApplications = (engine: Engine) => {
  const { data, isLoading, error } = useQueryArray<ApplicationDto>({
    query: () => engine.applicationService.getApplications(),
    deps: [engine],
  })

  return { applications: data, isLoading, error }
}
