import { useCallback, useEffect, useState } from 'react'
import { BosRedirectMap, getRedirectMap } from '../../services/dev-server-service'
import stringify from 'json-stringify-deterministic'

const DevModeUpdateInterval = 1500

export const useDevMode = () => {
  const [redirectMap, setRedirectMap] = useState<BosRedirectMap | null>(null)
  const [isDevMode, setIsDevMode] = useState(false)

  useEffect(() => {
    if (!isDevMode) {
      setRedirectMap(null)
      return
    }

    let isMount = true

    const timer = setInterval(async () => {
      const newRedirectMap = await getRedirectMap()
      if (!isMount) return

      // prevents rerendering
      setRedirectMap((prev) =>
        stringify(prev) !== stringify(newRedirectMap) ? newRedirectMap : prev
      )
    }, DevModeUpdateInterval)

    return () => {
      isMount = false
      clearInterval(timer)
    }
  }, [isDevMode])

  const enableDevMode = useCallback(() => {
    setIsDevMode(true)
  }, [])

  const disableDevMode = useCallback(() => {
    setIsDevMode(false)
  }, [])

  return {
    redirectMap,
    enableDevMode,
    disableDevMode,
  }
}
