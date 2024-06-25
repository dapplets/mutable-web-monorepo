import { useContext, useState } from 'react'
import { MutableWebContext } from './mutable-web-context'

export function useMutationApp(appId: string) {
  const { engine, setMutationApps, selectedMutation } = useContext(MutableWebContext)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enableApp = async () => {
    if (!selectedMutation) {
      throw new Error('No selected mutation')
    }

    try {
      setIsLoading(true)

      await engine.applicationService.enableAppInMutation(selectedMutation.id, appId)

      setMutationApps((apps) =>
        apps.map((app) =>
          app.id === appId ? { ...app, settings: { ...app.settings, isEnabled: true } } : app
        )
      )
    } catch (err) {
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

      await engine.applicationService.disableAppInMutation(selectedMutation.id, appId)

      setMutationApps((apps) =>
        apps.map((app) =>
          app.id === appId ? { ...app, settings: { ...app.settings, isEnabled: false } } : app
        )
      )
    } catch (err) {
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
