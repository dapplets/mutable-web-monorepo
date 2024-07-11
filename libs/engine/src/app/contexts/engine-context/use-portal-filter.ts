import { useMemo } from 'react'
import { useEngine } from './use-engine'
import { IContextNode } from '@mweb/core'
import { TargetService } from '../../services/target/target.service'

export const usePortalFilter = (context: IContextNode, insPointName?: string) => {
  const { portals } = useEngine()

  const components = useMemo(() => {
    const portalsEntries = Array.from(portals.entries())
    portalsEntries
      .filter(
        ([, { target }]) =>
          !TargetService.isTargetMet(target, context) || target.injectTo === insPointName
      )
      .forEach(([, { ifNoTarget }]) => ifNoTarget?.())
    // ToDo: improve readability
    return portalsEntries
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
