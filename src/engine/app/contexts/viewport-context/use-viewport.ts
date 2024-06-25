import { useContext } from 'react'
import { ViewportContext } from './viewport-context'

export function useViewport() {
  return useContext(ViewportContext)
}
