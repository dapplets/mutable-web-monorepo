import * as React from 'react'
import { useState, useCallback, useMemo } from 'react'
import { useEngine } from '../app/contexts/engine-context'
import { InjectableTarget, Portal } from '../app/contexts/engine-context/engine-context'
import { utils } from '@mweb/backend'
import { IContextNode } from '@mweb/core'
import { buildTransferableContext } from '../app/common/transferable-context'

const _DappletPortal: React.FC<{
  component?: React.FC
  target: InjectableTarget
  inMemory?: boolean
  _onContextStarted?: (context: IContextNode) => void
  _onContextFinished?: (context: IContextNode) => void
}> = ({ component, target, inMemory, _onContextStarted, _onContextFinished }) => {
  const key = React.useId()
  const { addPortal, removePortal } = useEngine()

  React.useEffect(() => {
    const portal: Portal = {
      key,
      target,
      component,
      inMemory: inMemory ?? false,
      onContextStarted: _onContextStarted,
      onContextFinished: _onContextFinished,
    }
    addPortal(key, portal)
    return () => removePortal(key)
  }, [target, component, key, inMemory, _onContextStarted, _onContextFinished])

  return null
}

export const FirstTargetTransformerHoc = <
  T extends { target: InjectableTarget; isFirstTargetOnly?: boolean },
>(
  Component: React.FC<T>
) => {
  return (props: T) => {
    const [firstContext, setFirstContext] = useState<IContextNode | null>(null)

    const handleContextStartedOrFinished = useCallback(
      (context: IContextNode) => {
        // ToDo: tha similar code is in the context manager
        const rootContext = utils.getRootContext(context)
        const foundContext = utils.findContextByTarget(props.target, rootContext)
        setFirstContext(foundContext)
      },
      [props.target]
    )

    const firstInjectableTarget = useMemo(() => {
      return firstContext
        ? { ...buildTransferableContext(firstContext), injectTo: props.target.injectTo }
        : null
    }, [firstContext, props.target])

    if (!props.isFirstTargetOnly) {
      return <Component {...props} />
    }

    return (
      <>
        <_DappletPortal
          inMemory
          target={props.target}
          _onContextStarted={handleContextStartedOrFinished}
          _onContextFinished={handleContextStartedOrFinished}
        />
        {firstInjectableTarget ? <Component {...props} target={firstInjectableTarget} /> : null}
      </>
    )
  }
}

export const DappletPortalAndSearcher = FirstTargetTransformerHoc(_DappletPortal)

export const DappletPortal: React.FC<any> = (props) => {
  return (
    <DappletPortalAndSearcher
      {...props}
      // These props should not be exported to the BOS
      _onContextFinished={undefined}
      _onContextStarted={undefined}
    />
  )
}
