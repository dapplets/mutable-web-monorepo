import { MutableWebContext } from './mutable-web-context'
import { EntityId } from '@mweb/backend'
import { useContext, useMemo } from 'react'

export const useMutation = (mutationId: EntityId | undefined | null) => {
  const { mutations } = useContext(MutableWebContext)

  const mutation = useMemo(
    () => (mutationId ? mutations.find((mutation) => mutation.id === mutationId) ?? null : null),
    [mutations, mutationId]
  )

  return { mutation }
}
