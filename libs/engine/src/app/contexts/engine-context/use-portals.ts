import { useCallback, useState } from 'react'
import { Portal } from './engine-context'

export const usePortals = () => {
  const [portals, setPortals] = useState(new Map<string, Portal>())

  const addPortal = useCallback((key: string, portal: Portal) => {
    setPortals((prev) => new Map(prev.set(key, portal)))
  }, [])

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
