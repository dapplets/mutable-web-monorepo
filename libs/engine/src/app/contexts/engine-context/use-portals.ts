import { useCallback, useState } from 'react'
import { InjectableTarget } from './engine-context'

export const usePortals = () => {
  const [portals, setPortals] = useState(
    new Map<
      string,
      { component: React.FC<unknown>; target: InjectableTarget; ifNoTarget?: () => void }
    >()
  )

  const addPortal = useCallback(
    <T>(key: string, target: InjectableTarget, component: React.FC<T>, ifNoTarget?: () => void) => {
      setPortals(
        (prev) =>
          new Map(prev.set(key, { component: component as React.FC<unknown>, target, ifNoTarget }))
      )
    },
    []
  )

  const removePortal = useCallback((key: string) => {
    setPortals((prev) => {
      prev.delete(key)
      return new Map(prev)
    })
  }, [])

  return {
    portals,
    addPortal,
    removePortal,
  }
}
