import React, { FC, ReactElement, useCallback, useState } from 'react'
import { PortalContext, PortalContextState, Portal } from './portal-context'

type Props = {
  children?: ReactElement
}

const PortalProvider: FC<Props> = ({ children }) => {
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

  const state: PortalContextState = {
    portals,
    addPortal,
    removePortal,
  }

  return <PortalContext.Provider value={state}>{children}</PortalContext.Provider>
}

export { PortalProvider }
