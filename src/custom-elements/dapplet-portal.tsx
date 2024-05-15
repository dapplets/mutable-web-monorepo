import * as React from 'react'
import { engineSingleton } from '../engine'
import { InjectableTarget } from '../providers/provider'

const _DappletPortal: React.FC<{ component: React.FC; target: InjectableTarget }> = ({
  component: Component,
  target,
}) => {
  // ToDo: remove singleton
  React.useEffect(() => {
    engineSingleton?.injectComponent(target, Component)

    return () => {
      engineSingleton?.unjectComponent(target, Component)
    }
  }, [target, Component])

  return null
}

export const DappletPortal: React.FC<any> = (props) => {
  return <_DappletPortal {...props} />
}
