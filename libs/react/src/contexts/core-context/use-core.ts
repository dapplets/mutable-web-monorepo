import { useContext } from 'react'
import { CoreContext } from './core-context'

export function useCore() {
  return useContext(CoreContext)
}
