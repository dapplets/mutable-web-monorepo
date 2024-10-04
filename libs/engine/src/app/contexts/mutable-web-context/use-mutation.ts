import { MutableWebContext } from './mutable-web-context'
import { EntityId } from '@mweb/backend'
import { useContext, useMemo } from 'react'

export const useMutation = (mutationId: EntityId) => {
  const { mutations } = useContext(MutableWebContext)

  const mutation = useMemo(
    () => mutations.find((mutation) => mutation.id === mutationId) ?? null,
    [mutations, mutationId]
  )

  return { mutation }
}
