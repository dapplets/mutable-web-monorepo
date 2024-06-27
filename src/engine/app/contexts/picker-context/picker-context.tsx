import { createContext } from 'react'
import { Target } from '../../services/target/target.entity'
import { IContextNode } from '../../../../core'

export type TLatchVariant = 'primary' | 'secondary'

export type PickerTask = {
  target?: Target[]
  onClick?: (context: IContextNode) => void
  LatchComponent?: React.FC<{
    context: IContextNode
    variant: TLatchVariant
    contextDimensions: { width: number; height: number }
  }>
}

export type PickerContextState = {
  pickerTask: PickerTask | null
  setPickerTask: (picker: PickerTask | null) => void
}

export const contextDefaultValues: PickerContextState = {
  pickerTask: null,
  setPickerTask: () => undefined,
}

export const PickerContext = createContext<PickerContextState>(contextDefaultValues)
