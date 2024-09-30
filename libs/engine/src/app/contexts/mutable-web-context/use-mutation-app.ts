import { useContext, useState } from 'react'
import { MutableWebContext } from './mutable-web-context'

export function useMutationApp(appInstanceId: string) {
  const { engine, setMutationApps, selectedMutation } = useContext(MutableWebContext)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enableApp = async () => {
    if (!selectedMutation) {
      throw new Error('No selected mutation')
    }

    try {
      setIsLoading(true)

      await engine.applicationService.enableAppInstanceInMutation(
        selectedMutation.id,
        appInstanceId
      )

      setMutationApps((apps) =>
        apps.map((app) =>
          app.instanceId === appInstanceId
            ? { ...app, settings: { ...app.settings, isEnabled: true } }
            : app
        )
      )
    } catch (err) {
      console.error(err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unknown error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const disableApp = async () => {
    if (!selectedMutation) {
      throw new Error('No selected mutation')
    }

    try {
      setIsLoading(true)

      await engine.applicationService.disableAppInstanceInMutation(
        selectedMutation.id,
        appInstanceId
      )

      setMutationApps((apps) =>
        apps.map((app) =>
          app.instanceId === appInstanceId
            ? { ...app, settings: { ...app.settings, isEnabled: false } }
            : app
        )
      )
    } catch (err) {
      console.error(err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unknown error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return { enableApp, disableApp, isLoading, error }
}
