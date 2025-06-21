import { useContext } from 'react'
import { FullscreenProviderContext } from './fullscreen-context'

export const useFullscreen = () => {
  const context = useContext(FullscreenProviderContext)

  if (context === undefined)
    throw new Error('useFullscreen must be used within a FullscreenProvider')

  return context
}
