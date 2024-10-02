import { MutationDto } from '@mweb/backend'
import { useContext, useState } from 'react'
import { MutableWebContext } from './mutable-web-context'
import { SaveMutationOptions } from '@mweb/backend'

export function useEditMutation() {
  const { engine, setMutations } = useContext(MutableWebContext)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const editMutation = async (editingMutation: MutationDto, options?: SaveMutationOptions) => {
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
