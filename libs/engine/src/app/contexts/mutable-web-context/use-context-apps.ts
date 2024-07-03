import { useMemo } from 'react'
import { IContextNode } from '@mweb/core'
import { useMutableWeb } from './use-mutable-web'

export const useContextApps = (context: IContextNode) => {
  const { engine, activeApps } = useMutableWeb()

  const apps = useMemo(
    () => engine.applicationService.filterSuitableApps(activeApps, context),
    [engine, activeApps, context]
  )

  // ToDo: implement injectOnce
  // ToDo: update if new apps enabled

  return { apps }
}
