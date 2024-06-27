import { useContext } from 'react'
import { PickerContext } from './picker-context'

export function usePicker() {
  return useContext(PickerContext)
}
