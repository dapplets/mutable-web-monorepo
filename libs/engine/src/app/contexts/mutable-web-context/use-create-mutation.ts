import { useContext, useState } from 'react'
import { MutableWebContext } from './mutable-web-context'
import { SaveMutationOptions } from '../../services/mutation/mutation.service'
import { MutationCreateDto } from '../../services/mutation/dtos/mutation-create.dto'

export function useCreateMutation() {
  const { engine, setMutations } = useContext(MutableWebContext)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createMutation = async (
    creatingMutation: MutationCreateDto,
    options?: SaveMutationOptions
  ) => {
    try {
      setIsLoading(true)

      const createdMutation = await engine.mutationService.createMutation(creatingMutation, options)

      setMutations((mutations) => [...mutations, createdMutation])
    } catch (err) {
      console.error(err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unknown error')
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { createMutation, isLoading, error }
}
