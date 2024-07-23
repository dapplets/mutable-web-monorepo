import { useMemo } from 'react'
import { IContextNode } from '@mweb/core'
import { useMutableWeb } from '.'

export const useAppControllers = (context: IContextNode) => {
  const { engine, selectedMutation, activeApps } = useMutableWeb()

  const controllers = useMemo(() => {
    if (!engine || !selectedMutation?.id) {
      return []
    } else {
      return engine.userLinkService.getControllersForApps(activeApps, context)
    }
  }, [engine, selectedMutation, activeApps, context])

  return { controllers }
}
