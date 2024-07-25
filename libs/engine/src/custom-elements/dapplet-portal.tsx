import * as React from 'react'
import { useEngine } from '../app/contexts/engine-context'
import { InjectableTarget, Portal } from '../app/contexts/engine-context/engine-context'
import { TransferableContext } from '../app/common/transferable-context'

const _DappletPortal: React.FC<{
  component: React.FC // ToDo: add props
  target: InjectableTarget
  onContextStarted?: (context: TransferableContext) => void
  onContextFinished?: (context: TransferableContext) => void
}> = ({ component, target, onContextStarted, onContextFinished }) => {
  const key = React.useId()
  const { addPortal, removePortal } = useEngine()

  React.useEffect(() => {
    const portal: Portal = { target, component, onContextStarted, onContextFinished }
    addPortal(key, portal)
    return () => removePortal(key)
  }, [target, component, key])

  return null
}

export const DappletPortal: React.FC<any> = (props) => {
  return <_DappletPortal {...props} />
}
