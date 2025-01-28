import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AppInstanceWithSettings } from '@mweb/backend'
import { MutationDto } from '@mweb/backend'
import { useEngine } from '../engine'
import { useEffect } from 'react'

export const useMutationApps = (mutation?: MutationDto | null) => {
  const { engine } = useEngine()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery<AppInstanceWithSettings[]>({
    queryKey: ['mutationApps', { mutationId: mutation?.id }],
    queryFn: () =>
      mutation ? engine.applicationService.getAppsFromMutation(mutation) : Promise.resolve([]),
    initialData: [],
  })

  useEffect(() => {
    const sub = engine.eventService.on('appEnabledStatusChanged', (event) => {
      queryClient.setQueryData(
        ['mutationApps', { mutationId: event.mutationId }],
        (apps: AppInstanceWithSettings[]) =>
          apps.map((app) =>
            app.instanceId === event.appInstanceId
              ? { ...app, settings: { ...app.settings, isEnabled: event.isEnabled } }
              : app
          )
      )
    })
    return () => sub.remove()
  }, [mutation, engine])

  return { mutationApps: data, isLoading, error }
}
