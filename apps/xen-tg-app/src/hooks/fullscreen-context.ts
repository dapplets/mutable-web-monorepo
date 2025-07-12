import { createContext } from 'react'

type FullscreenProviderState = {
  isFullscreenEnabled: boolean
  switchFullscreen: () => void
}

const initialState: FullscreenProviderState = {
  isFullscreenEnabled: true,
  switchFullscreen: () => null,
}

export const FullscreenProviderContext = createContext<FullscreenProviderState>(initialState)
