import React from 'react'
import { FC } from 'react'
import styled from 'styled-components'
import { AppSwitcher } from '../app-switcher'
import {
  useGetMutationVersion,
  useGetSelectedMutation,
  useMutation,
  useMutationApps,
  usePreferredSource,
} from '@mweb/react-engine'
import { useEngine } from '../../contexts/engine-context'

const AppsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 5px 6px 5px 7px;
  gap: 10px;
  max-height: calc(100vh - 300px);
  overflow-y: auto;
  overflow-x: hidden;

  /* width */
  &::-webkit-scrollbar {
    width: 5px;
  }

  /* Track */
  &::-webkit-scrollbar-track {
    box-shadow: inset 0 0 5px grey;
    border-radius: 10px;
  }

  /* Handle */
  &::-webkit-scrollbar-thumb {
    background: #1879ce70;
    border-radius: 10px;
  }

  /* Handle on hover */
  &::-webkit-scrollbar-thumb:hover {
    background: #1879ced8;
  }

  & button {
    direction: ltr;
  }
`

const Applications: FC = () => {
  const { tree } = useEngine()
  const { selectedMutationId } = useGetSelectedMutation(tree?.id)
  const { preferredSource } = usePreferredSource(selectedMutationId, tree?.id)
  const { mutationVersion } = useGetMutationVersion(selectedMutationId)
  const { mutation } = useMutation(selectedMutationId, preferredSource, mutationVersion)
  const { mutationApps } = useMutationApps(mutation?.id, mutation?.apps ?? [])

  if (!selectedMutationId) return null

  return (
    <AppsWrapper>
      {mutationApps.map((app) => (
        <AppSwitcher
          key={`${app.id}/${app.instanceId}`}
          mutationId={selectedMutationId}
          app={app}
        />
      ))}
    </AppsWrapper>
  )
}

export default Applications
