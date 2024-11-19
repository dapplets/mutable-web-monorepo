import { MutationDto } from '@mweb/backend'
import { useState } from 'react'
import { SaveMutationOptions } from '@mweb/backend'
import { useMutableWeb } from '../mutable-web-context'
import { useMutations } from './use-mutations'

export function useEditMutation() {
  const { engine, refreshSelectedMutation } = useMutableWeb()
  const { setMutations } = useMutations()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const editMutation = async (editingMutation: MutationDto, options?: SaveMutationOptions) => {
    try {
      setIsLoading(true)

      const editedMutation = await engine.mutationService.editMutation(editingMutation, options)

      setMutations((mutations) =>
        mutations.map((mut) =>
          mut.id === editedMutation.id && mut.source === editedMutation.source
            ? editedMutation
            : mut
        )
      )

      refreshSelectedMutation(editedMutation)
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
