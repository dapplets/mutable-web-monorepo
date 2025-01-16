import React, { FC, ReactElement, useEffect, useState } from 'react'
import { DevContext, DevContextState } from './dev-context'
import { BosRedirectMap, getRedirectMap } from '@mweb/backend'
import stringify from 'json-stringify-deterministic'

const DevModeUpdateInterval = 1500

type Props = {
  devServerUrl?: string | null
  children?: ReactElement
}

const DevProvider: FC<Props> = ({ children, devServerUrl }) => {
  const [isLoading, setIsLoading] = useState(!!devServerUrl)
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

      setIsLoading(false)
    }, DevModeUpdateInterval)

    return () => {
      isMount = false
      clearInterval(timer)
    }
  }, [devServerUrl])

  const state: DevContextState = {
    redirectMap,
    isDevServerLoading: isLoading,
  }

  return <DevContext.Provider value={state}>{children}</DevContext.Provider>
}

export { DevProvider }
