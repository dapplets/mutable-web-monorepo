import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { AppInstanceWithSettings } from '@mweb/backend'

export function useDisableApp(mutationId: string, appInstanceId: string) {
  const queryClient = useQueryClient()
  const { engine } = useEngine()

  const { mutate, isPending, error } = useMutation({
    mutationFn: () =>
      engine.applicationService.disableAppInstanceInMutation(mutationId, appInstanceId),
    onSuccess: () => {
      queryClient.setQueryData(
        ['mutationApps', { mutationId }],
        (apps: AppInstanceWithSettings[]) =>
          apps.map((app) =>
            app.instanceId === appInstanceId
              ? { ...app, settings: { ...app.settings, isEnabled: false } }
              : app
          )
      )
    },
  })

  return { disableApp: () => mutate(), isLoading: isPending, error }
}
