import { useCallback, useEffect, useState } from 'react'
import { AppWithSettings } from '../../services/application/application.entity'
import { Mutation } from '../../services/mutation/mutation.entity'
import { Engine } from '../../../engine'

export const useMutationApps = (engine: Engine, mutation?: Mutation | null) => {
  const [mutationApps, setMutationApps] = useState<AppWithSettings[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMutationApps = useCallback(async () => {
    if (!mutation) {
      setMutationApps([])
      return
    }

    try {
      setIsLoading(true)

      // ToDo: move to service
      const apps = await Promise.all(
        mutation.apps.map((appId) =>
          engine.applicationService
            .getApplication(appId)
            .then((appMetadata) =>
              appMetadata
                ? engine.applicationService.populateAppWithSettings(mutation.id, appMetadata)
                : null
            )
        )
      ).then((apps) => apps.filter((app) => app !== null) as AppWithSettings[])

      setMutationApps(apps)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unknown error')
      }
    } finally {
      setIsLoading(false)
    }
  }, [engine, mutation])

  useEffect(() => {
    loadMutationApps()
  }, [loadMutationApps])

  return {
    mutationApps,
    setMutationApps,
    isLoading,
    error,
  }
}
