import { Mutation } from '../../services/mutation/mutation.entity'
import { useContext, useState } from 'react'
import { MutableWebContext } from './mutable-web-context'
import { SaveMutationOptions } from '../../services/mutation/mutation.service'

export function useEditMutation() {
  const { engine, setMutations } = useContext(MutableWebContext)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const editMutation = async (editingMutation: Mutation, options?: SaveMutationOptions) => {
    try {
      setIsLoading(true)

      const editedMutation = await engine.mutationService.editMutation(editingMutation, options)

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
