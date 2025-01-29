import { AppInMutation, AppInstanceWithSettings } from '@mweb/backend'
import { useQueries } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { utils } from '@mweb/backend'

export const useMutationApps = (mutationId: string | null = null, apps: AppInMutation[] = []) => {
  const { engine } = useEngine()

  const queries = useQueries({
    queries: mutationId
      ? apps.map((app) => ({
          queryKey: ['mutationApp', mutationId, utils.constructAppInstanceId(app)],
          queryFn: () => engine.applicationService.getAppInstanceWithSettings(mutationId, app),
          initialData: null,
        }))
      : [],
  })

  const isLoading = queries.some((query) => query.isFetching)
  const mutationApps = isLoading
    ? []
    : (queries.map((query) => query.data) as AppInstanceWithSettings[])
  const error = queries.find((query) => query.isError)?.error

  return { mutationApps, isLoading, error }
}
