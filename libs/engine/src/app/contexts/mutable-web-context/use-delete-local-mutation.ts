import { EntityId, EntitySourceType } from '@mweb/backend'
import { useContext, useState } from 'react'
import { MutableWebContext } from './mutable-web-context'

export function useDeleteLocalMutation() {
  const { engine, setMutations } = useContext(MutableWebContext)

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
