import { AppInstanceWithSettings, MutationDto } from '@mweb/backend'
import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'

export const useMutationApps = (mutation?: MutationDto | null) => {
  const { engine } = useEngine()

  const { data, isLoading, error } = useQuery<AppInstanceWithSettings[]>({
    queryKey: ['mutationApps', { mutationId: mutation?.id }],
    queryFn: () =>
      mutation ? engine.applicationService.getAppsFromMutation(mutation) : Promise.resolve([]),
    initialData: [],
  })

  return { mutationApps: data, isLoading, error }
}
