import {
  useGetMutationVersion,
  useGetSelectedMutation,
  useMutation,
  useMutationApps,
  usePreferredSource,
} from '@mweb/react-engine'
import React, { FC } from 'react'
import styled from 'styled-components'
import { useEngine } from '../../contexts/engine-context'
import AppCard from '../components/app-card'
import PageLayout from '../components/page-layout'

const AppsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: calc(100% - 20px);
  padding: 0 10px;
  margin: 5px 0;
  gap: 10px;
  max-height: calc(100vh - 140px);
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
  const appsRef = React.useRef<HTMLDivElement>(null)

  if (!selectedMutationId) return null

  return (
    <PageLayout ref={appsRef} title={mutation?.metadata.name + ' apps' || ''}>
      <AppsWrapper>
        {mutationApps.map((app) => (
          <AppCard key={`${app.id}/${app.instanceId}`} app={app} mutationId={selectedMutationId} />
        ))}
      </AppsWrapper>
    </PageLayout>
  )
}

export default Applications
