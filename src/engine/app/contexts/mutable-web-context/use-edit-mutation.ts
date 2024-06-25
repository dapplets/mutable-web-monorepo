import { Mutation } from '../../services/mutation/mutation.entity'
import { useContext, useState } from 'react'
import { MutableWebContext } from './mutable-web-context'

export function useEditMutation() {
  const { engine, setMutations } = useContext(MutableWebContext)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const editMutation = async (editingMutation: Mutation) => {
    try {
      setIsLoading(true)

      const editedMutation = await engine.mutationService.editMutation(editingMutation)

      setMutations((mutations) =>
        mutations.map((mut) => (mut.id === editedMutation.id ? editedMutation : mut))
      )
    } catch (err) {
      console.error(err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unknown error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return { editMutation, isLoading, error }
}
