import { useContext } from 'react'
import { ApplicationsContext } from './applications-context'

export function useApplications() {
  return useContext(ApplicationsContext)
}
