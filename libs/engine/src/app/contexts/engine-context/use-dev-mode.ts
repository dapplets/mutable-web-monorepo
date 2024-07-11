import { useEffect, useState } from 'react'
import { BosRedirectMap, getRedirectMap } from '../../services/dev-server-service'
import stringify from 'json-stringify-deterministic'

const DevModeUpdateInterval = 1500

export const useDevMode = (devServerUrl?: string | null) => {
  const [redirectMap, setRedirectMap] = useState<BosRedirectMap | null>(null)

  useEffect(() => {
    if (!devServerUrl) {
      setRedirectMap(null)
      return
    }

    let isMount = true

    const timer = setInterval(async () => {
      const newRedirectMap = await getRedirectMap(devServerUrl)
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
  }, [devServerUrl])

  return {
    redirectMap,
  }
}