import { EntityId } from '@mweb/backend'
import { useMemo } from 'react'
import { useMutations } from '../mutations-context'

export const useMutation = (mutationId: EntityId | undefined | null) => {
  const { mutations } = useMutations()

  const mutation = useMemo(
    () => (mutationId ? mutations.find((mutation) => mutation.id === mutationId) ?? null : null),
    [mutations, mutationId]
  )

  return { mutation }
}
