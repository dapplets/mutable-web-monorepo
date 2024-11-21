import { MutationCreateDto, MutationDto, MutationWithSettings } from '@mweb/backend'
import { useState } from 'react'
import { SaveMutationOptions } from '@mweb/backend'
import { useMutableWeb } from '../mutable-web-context'
import { useMutations } from './use-mutations'

export function useSaveMutation() {
  const { engine } = useMutableWeb()
  const { setMutations } = useMutations()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveMutation = async (
    savingMutation: MutationDto | MutationCreateDto,
    options?: SaveMutationOptions
  ): Promise<MutationWithSettings> => {
    try {
      setIsLoading(true)

      const savedMutation = await engine.mutationService.saveMutation(savingMutation, options)

      setMutations((mutations) => {
        const mutationExists = mutations.some(
          (mut) => mut.id === savedMutation.id && mut.source === savedMutation.source
        )

        if (mutationExists) {
          return mutations.map((mut) =>
            mut.id === savedMutation.id && mut.source === savedMutation.source ? savedMutation : mut
          )
        } else {
          return [...mutations, savedMutation]
        }
      })

      return savedMutation
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

  return { saveMutation, isLoading, error }
}
