import { useCallback, useEffect, useState } from 'react'
import { AppMetadata } from '../../services/application/application.entity'
import { Engine } from '../../../engine'

export const useApplications = (engine: Engine) => {
  const [applications, setApplications] = useState<AppMetadata[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadApps = useCallback(async () => {
    try {
      setIsLoading(true)

      const applications = await engine.applicationService.getApplications()
      setApplications(applications)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unknown error')
      }
    } finally {
      setIsLoading(false)
    }
  }, [engine])

  useEffect(() => {
    loadApps()
  }, [loadApps])

  return {
    applications,
    isLoading,
    error,
  }
}
