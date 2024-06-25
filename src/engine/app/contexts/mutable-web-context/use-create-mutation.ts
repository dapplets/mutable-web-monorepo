import { useContext, useState } from 'react'
import { MutableWebContext } from './mutable-web-context'
import { Mutation } from '../../services/mutation/mutation.entity'

export function useCreateMutation() {
  const { engine, setMutations } = useContext(MutableWebContext)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createMutation = async (creatingMutation: Mutation) => {
    try {
      setIsLoading(true)

      const createdMutation = await engine.mutationService.createMutation(creatingMutation)

      setMutations((mutations) => [...mutations, createdMutation])
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

  return { createMutation, isLoading, error }
}
