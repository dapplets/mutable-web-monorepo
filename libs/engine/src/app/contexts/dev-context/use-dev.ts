import { useContext } from 'react'
import { DevContext } from './dev-context'

export function useDev() {
  return useContext(DevContext)
}
