import React, { FC, ReactElement, useEffect } from 'react'
import { EngineContext, EngineContextState } from './engine-context'
import { usePortals } from './use-portals'
import { useDevMode } from './use-dev-mode'

type Props = {
  children?: ReactElement
}

const EngineProvider: FC<Props> = ({ children }) => {
  const { portals, addPortal, removePortal } = usePortals()
  const { redirectMap, enableDevMode, disableDevMode } = useDevMode()

  useEffect(() => {
    console.log('[MutableWeb] Dev mode:', {
      enableDevMode,
      disableDevMode,
    })
  }, [enableDevMode, disableDevMode])

  const state: EngineContextState = {
    portals,
    addPortal,
    removePortal,
    redirectMap,
    enableDevMode,
    disableDevMode,
  }

  return <EngineContext.Provider value={state}>{children}</EngineContext.Provider>
}

export { EngineProvider }
