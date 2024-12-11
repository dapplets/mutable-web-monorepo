import { useState } from 'react'
import { SaveMutationOptions } from '@mweb/backend'
import { MutationCreateDto } from '@mweb/backend'
import { useMutableWeb } from '../mutable-web-context'
import { useMutations } from './use-mutations'

export function useCreateMutation() {
  const { engine } = useMutableWeb()
  const { setMutations } = useMutations()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createMutation = async (
    creatingMutation: MutationCreateDto,
    options?: SaveMutationOptions
  ): Promise<string> => {
    try {
      setIsLoading(true)
      const createdMutation = await engine.mutationService.createMutation(creatingMutation, options)
      setMutations((mutations) => [...mutations, createdMutation])
      return createdMutation.id
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
