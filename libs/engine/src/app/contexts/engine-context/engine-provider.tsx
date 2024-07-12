import React, { FC, ReactElement, useEffect } from 'react'
import { EngineContext, EngineContextState } from './engine-context'
import { usePortals } from './use-portals'
import { useDevMode } from './use-dev-mode'

type Props = {
  devServerUrl?: string | null
  children?: ReactElement
}

const EngineProvider: FC<Props> = ({ children, devServerUrl }) => {
  const { portals, addPortal, removePortal } = usePortals()
  const { redirectMap, isLoading: isDevServerLoading } = useDevMode(devServerUrl)

  const state: EngineContextState = {
    portals,
    addPortal,
    removePortal,
    redirectMap,
    isDevServerLoading,
  }

  return <EngineContext.Provider value={state}>{children}</EngineContext.Provider>
}

export { EngineProvider }
