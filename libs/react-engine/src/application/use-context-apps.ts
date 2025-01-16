import { useMemo } from 'react'
import { IContextNode } from '@mweb/core'
import { ApplicationDto } from '@mweb/backend'
import { useEngine } from '../engine'

export const useContextApps = (context: IContextNode, activeApps: ApplicationDto[]) => {
  const { engine } = useEngine()

  const apps = useMemo(
    // ToDo: activeApps is not scalar
    () => engine.applicationService.filterSuitableApps(activeApps, context),
    [engine, activeApps, context]
  )

  // ToDo: implement injectOnce
  // ToDo: update if new apps enabled

  return { apps }
}
