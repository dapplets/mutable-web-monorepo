import { createContext } from 'react'
import { ApplicationDto } from '@mweb/backend'

export type ApplicationsContextState = {
  applications: ApplicationDto[]
  isLoading: boolean
}

export const contextDefaultValues: ApplicationsContextState = {
  applications: [],
  isLoading: true,
}

export const ApplicationsContext = createContext<ApplicationsContextState>(contextDefaultValues)
