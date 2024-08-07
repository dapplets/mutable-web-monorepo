import { useCallback, useEffect, useState } from 'react'
import { AppMetadata } from '../../services/application/application.entity'
import { ParserConfig } from '../../services/parser-config/parser-config.entity'
import { Engine } from '../../../engine'

export const useMutationParsers = (engine: Engine, apps: AppMetadata[]) => {
  const [parserConfigs, setParserConfigs] = useState<ParserConfig[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMutationParsers = useCallback(async () => {
    try {
      setIsLoading(true)

      const parserConfigs = await engine.parserConfigService.getParserConfigsForApps(apps)

      setParserConfigs(parserConfigs)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unknown error')
      }
    } finally {
      setIsLoading(false)
    }
  }, [engine, apps])

  useEffect(() => {
    loadMutationParsers()
  }, [loadMutationParsers])

  return {
    parserConfigs,
    isLoading,
    error,
  }
}
