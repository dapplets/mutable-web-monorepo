import React, { FC, ReactNode } from 'react'
import { ApplicationsContext, ApplicationsContextState } from './applications-context'
import { useCore } from '@mweb/react'
import { useQueryArray } from '../../hooks/use-query-array'
import { ApplicationDto } from '@mweb/backend'
import { useMutableWeb } from '../mutable-web-context'

type Props = {
  children?: ReactNode
}

const ApplicationsProvider: FC<Props> = ({ children }) => {
  const { engine } = useMutableWeb()

  const { data: applications, isLoading } = useQueryArray<ApplicationDto>({
    query: () => engine.applicationService.getApplications(),
    deps: [engine],
  })

  const state: ApplicationsContextState = {
    applications,
    isLoading,
  }

  return <ApplicationsContext.Provider value={state}>{children}</ApplicationsContext.Provider>
}

export { ApplicationsProvider }
