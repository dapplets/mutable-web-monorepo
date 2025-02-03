import { useContext } from 'react'
import { PortalContext } from './portal-context'

export function usePortal() {
  return useContext(PortalContext)
}
