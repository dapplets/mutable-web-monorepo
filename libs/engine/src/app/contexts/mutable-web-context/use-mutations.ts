import { useCallback, useEffect, useState } from 'react'
import { useCore } from '../../../../react'
import { MutationWithSettings } from '../../services/mutation/mutation.entity'
import { Engine } from '../../../engine'

export const useMutations = (engine: Engine) => {
  const { core } = useCore()
  const [mutations, setMutations] = useState<MutationWithSettings[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMutations = useCallback(async () => {
    if (!engine) return;

    try {
      setIsLoading(true)

      const mutations = await engine.mutationService.getMutationsWithSettings(core.tree)
      setMutations(mutations)
    } catch (err) {
      console.log(err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unknown error')
      }
    } finally {
      setIsLoading(false)
    }
  }, [engine, core])

  useEffect(() => {
    loadMutations()
  }, [loadMutations])

  return {
    mutations,
    setMutations,
    isLoading,
    error,
  }
}
