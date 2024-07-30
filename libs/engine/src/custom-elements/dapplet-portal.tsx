import * as React from 'react'
import { useEngine } from '../app/contexts/engine-context'
import { InjectableTarget, Portal } from '../app/contexts/engine-context/engine-context'

const _DappletPortal: React.FC<{
  component: React.FC
  target: InjectableTarget
  inMemory?: boolean
}> = ({ component, target, inMemory }) => {
  const key = React.useId()
  const { addPortal, removePortal } = useEngine()

  React.useEffect(() => {
    const portal: Portal = { key, target, component, inMemory: inMemory ?? false }
    addPortal(key, portal)
    return () => removePortal(key)
  }, [target, component, key, inMemory])

  return null
}

export const DappletPortal: React.FC<any> = (props) => {
  return <_DappletPortal {...props} />
}
