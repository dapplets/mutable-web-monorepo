import React from 'react'
import { TransferableContext, Target } from '@mweb/backend'
import { buildTransferableContext } from '../app/common/transferable-context'
import { usePicker } from '../app/contexts/picker-context'
import { TLatchVariant } from '../app/contexts/picker-context/picker-context'

const _DappletContextPicker: React.FC<{
  target?: Target | Target[]
  onClick?: (ctx: TransferableContext) => void
  LatchComponent?: React.FC<{
    context: TransferableContext
    variant: TLatchVariant
    contextDimensions: { width: number; height: number }
  }>
}> = ({ target, onClick, LatchComponent }) => {
  const { setPickerTask } = usePicker()

  React.useEffect(() => {
    setPickerTask({
      target: Array.isArray(target) ? target : target ? [target] : undefined,
      onClick: (ctx) => onClick?.(buildTransferableContext(ctx)),
      LatchComponent: LatchComponent
        ? ({ context, variant, contextDimensions }) => (
            <LatchComponent
              context={buildTransferableContext(context)}
              variant={variant}
              contextDimensions={contextDimensions}
            />
          )
        : undefined,
    })
    return () => setPickerTask(null)
  }, [target, onClick, LatchComponent])

  return null
}

export const DappletContextPicker: React.FC<any> = (props) => {
  return <_DappletContextPicker {...props} />
}
