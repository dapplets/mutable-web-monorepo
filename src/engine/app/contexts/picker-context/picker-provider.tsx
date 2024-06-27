import React, { FC, ReactNode, useState } from 'react'
import { PickerContext, PickerContextState, PickerTask } from './picker-context'

type Props = {
  children?: ReactNode
}

const PickerProvider: FC<Props> = ({ children }) => {
  const [pickerTask, setPickerTask] = useState<PickerTask | null>(null)

  const state: PickerContextState = {
    pickerTask,
    setPickerTask,
  }

  return <PickerContext.Provider value={state}>{children}</PickerContext.Provider>
}

export { PickerProvider }
