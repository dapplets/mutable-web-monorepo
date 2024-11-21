import { EntityId, EntitySourceType } from '@mweb/backend'
import { useState } from 'react'
import { useMutableWeb } from '../mutable-web-context'
import { useMutations } from './use-mutations'

export function useDeleteLocalMutation() {
  const { engine } = useMutableWeb()
  const { setMutations } = useMutations()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteLocalMutation = async (mutationId: EntityId): Promise<void> => {
    try {
      setIsLoading(true)

      await engine.mutationService.deleteMutation(mutationId)

      setMutations((mutations) =>
        mutations.filter(
          (mutation) => !(mutation.id === mutationId && mutation.source === EntitySourceType.Local)
        )
      )
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

  return { deleteLocalMutation, isLoading, error }
}
