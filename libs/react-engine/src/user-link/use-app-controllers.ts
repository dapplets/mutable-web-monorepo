import { useMemo } from 'react'
import { IContextNode } from '@mweb/core'
import { AppInstanceWithSettings } from '@mweb/backend'
import { useEngine } from '../engine'

export const useAppControllers = (
  mutationId: string | null,
  context: IContextNode,
  apps: AppInstanceWithSettings[]
) => {
  const { engine } = useEngine()

  const controllers = useMemo(() => {
    if (!mutationId) {
      return []
    } else {
      // ToDo: activeApps is not scalar
      return engine.userLinkService.getControllersForApps(apps, context)
    }
  }, [engine, mutationId, apps, context])
  // ToDo: serialize deps?

  return { controllers }
}
