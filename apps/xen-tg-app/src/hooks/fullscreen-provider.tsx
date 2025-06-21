import { useState } from 'react'
import { FullscreenProviderContext } from './fullscreen-context'

type FullscreenProviderProps = {
  children: React.ReactNode
  storageKey?: string
}

export function FullscreenProvider({
  children,
  storageKey = 'fullscreen-enabled',
}: FullscreenProviderProps) {
  const [isFullscreenEnabled, setIsEnabled] = useState<boolean>(
    () => !(localStorage.getItem(storageKey) === 'disabled') // Default (without localStorage value) is enabled
  )

  const newTg = window.Telegram.WebApp as any // eslint-disable-line -- wait for a new version of @types/telegram-web-app
  if (!newTg.isFullscreen && newTg.requestFullscreen && isFullscreenEnabled)
    newTg.requestFullscreen()

  const value = {
    isFullscreenEnabled,
    switchFullscreen: () => {
      const newTg = window.Telegram.WebApp as any // eslint-disable-line -- wait for a new version of @types/telegram-web-app
      if (!newTg.isFullscreen && !isFullscreenEnabled && newTg.requestFullscreen) {
        newTg.requestFullscreen()
      } else if (newTg.isFullscreen && isFullscreenEnabled && newTg.exitFullscreen) {
        newTg.exitFullscreen()
      }
      localStorage.setItem(storageKey, isFullscreenEnabled ? 'disabled' : 'enabled')
      setIsEnabled(!isFullscreenEnabled)
    },
  }

  return (
    <FullscreenProviderContext.Provider value={value}>
      {children}
    </FullscreenProviderContext.Provider>
  )
}
