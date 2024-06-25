import { useMemo } from 'react'
import { useEngine } from './use-engine'
import { IContextNode } from '../../../../core'
import { TargetService } from '../../services/target/target.service'

export const usePortalFilter = (context: IContextNode, insPointName?: string) => {
  const { portals } = useEngine()

  const components = useMemo(() => {
    // ToDo: improve readability
    return Array.from(portals.entries())
      .filter(
        ([, { target }]) =>
          TargetService.isTargetMet(target, context) && target.injectTo === insPointName
      )
      .map(([key, { component, target }]) => ({
        key,
        target,
        component,
      }))
      .sort((a, b) => (b.key > a.key ? 1 : -1))
  }, [portals, context, insPointName])

  return { components }
}
