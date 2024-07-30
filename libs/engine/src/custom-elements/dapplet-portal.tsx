import * as React from 'react'
import { useEngine } from '../app/contexts/engine-context'
import { InjectableTarget, Portal } from '../app/contexts/engine-context/engine-context'

const _DappletPortal: React.FC<{
  component: React.FC
  target: InjectableTarget
}> = ({ component, target }) => {
  const key = React.useId()
  const { addPortal, removePortal } = useEngine()

  React.useEffect(() => {
    const portal: Portal = { key, target, component }
    addPortal(key, portal)
    return () => removePortal(key)
  }, [target, component, key])

  return null
}

export const DappletPortal: React.FC<any> = (props) => {
  return <_DappletPortal {...props} />
}
