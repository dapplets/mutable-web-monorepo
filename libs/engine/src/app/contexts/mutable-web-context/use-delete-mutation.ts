import { EntityId, MutationCreateDto, MutationDto, MutationWithSettings } from '@mweb/backend'
import { useContext, useState } from 'react'
import { MutableWebContext } from './mutable-web-context'
import { SaveMutationOptions } from '@mweb/backend'

export function useDeleteMutation() {
  const { engine, setMutations } = useContext(MutableWebContext)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteMutation = async (mutationId: EntityId): Promise<void> => {
    try {
      setIsLoading(true)

      await engine.mutationService.deleteMutation(mutationId)

      setMutations((mutations) => mutations.filter((mutation) => mutation.id !== mutationId))
    } catch (err) {
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

  return { deleteMutation, isLoading, error }
}
