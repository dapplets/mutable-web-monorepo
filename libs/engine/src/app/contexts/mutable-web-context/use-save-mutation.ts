import { MutationCreateDto, MutationDto, MutationWithSettings } from '@mweb/backend'
import { useContext, useState } from 'react'
import { MutableWebContext } from './mutable-web-context'
import { SaveMutationOptions } from '@mweb/backend'

export function useSaveMutation() {
  const { engine, setMutations } = useContext(MutableWebContext)

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
