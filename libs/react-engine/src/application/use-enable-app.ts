import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { AppInstanceWithSettings } from '@mweb/backend'

export function useEnableApp(mutationId: string, appInstanceId: string) {
  const queryClient = useQueryClient()
  const { engine } = useEngine()

  const { mutate, isPending, error } = useMutation({
    mutationFn: () =>
      engine.applicationService.enableAppInstanceInMutation(mutationId, appInstanceId),
    onSuccess: () => {
      queryClient.setQueryData(
        ['mutationApps', { mutationId }],
        (apps: AppInstanceWithSettings[]) =>
          apps.map((app) =>
            app.instanceId === appInstanceId
              ? { ...app, settings: { ...app.settings, isEnabled: true } }
              : app
          )
      )
    },
  })

  return { enableApp: () => mutate(), isLoading: isPending, error }
}
