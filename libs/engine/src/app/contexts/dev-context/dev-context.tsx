import { createContext } from 'react'
import { BosRedirectMap } from '@mweb/backend'

export type DevContextState = {
  redirectMap: BosRedirectMap | null
  isDevServerLoading: boolean
}

export const contextDefaultValues: DevContextState = {
  redirectMap: null,
  isDevServerLoading: false,
}

export const DevContext = createContext<DevContextState>(contextDefaultValues)
