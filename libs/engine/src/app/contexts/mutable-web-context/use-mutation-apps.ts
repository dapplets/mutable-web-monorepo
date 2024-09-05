import { useCallback, useEffect, useState } from 'react'
import { AppInstanceWithSettings } from '../../services/application/application.entity'
import { Mutation } from '../../services/mutation/mutation.entity'
import { Engine } from '../../../engine'

export const useMutationApps = (engine: Engine, mutation?: Mutation | null) => {
  const [mutationApps, setMutationApps] = useState<AppInstanceWithSettings[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMutationApps = useCallback(async () => {
    if (!mutation) {
      setMutationApps([])
      return
    }

    try {
      setIsLoading(true)

      const apps = await engine.applicationService.getAppsFromMutation(mutation)

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
