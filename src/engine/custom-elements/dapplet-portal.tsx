import * as React from 'react'
import { useEngine } from '../app/contexts/engine-context'
import { InjectableTarget } from '../app/contexts/engine-context/engine-context'

const _DappletPortal: React.FC<{ component: React.FC; target: InjectableTarget }> = ({
  component: Component,
  target,
}) => {
  const key = React.useId()
  const { addPortal, removePortal } = useEngine()

  React.useEffect(() => {
    addPortal(key, target, Component)
    return () => removePortal(key)
  }, [target, Component, key])

  return null
}

export const DappletPortal: React.FC<any> = (props) => {
  return <_DappletPortal {...props} />
}
