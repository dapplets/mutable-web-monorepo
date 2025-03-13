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
import { Spin } from 'antd'

const AppsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
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
  const { selectedMutationId, isLoading: isSelectedMutIdLoading } = useGetSelectedMutation(tree?.id)
  const { preferredSource, isLoading: isPreferredSourceLoading } = usePreferredSource(
    selectedMutationId,
    tree?.id
  )
  const { mutationVersion, isLoading: isMutationVersionLoading } =
    useGetMutationVersion(selectedMutationId)
  const { mutation, isMutationLoading } = useMutation(
    selectedMutationId,
    preferredSource,
    mutationVersion
  )
  const { mutationApps, isLoading } = useMutationApps(mutation?.id, mutation?.apps ?? [])
  const appsRef = React.useRef<HTMLDivElement>(null)

  if (!selectedMutationId) return null

  return !tree ||
    isSelectedMutIdLoading ||
    isPreferredSourceLoading ||
    isMutationVersionLoading ||
    isMutationLoading ||
    isLoading ? (
    <div
      style={{
        width: '100%',
        height: 40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Spin />
    </div>
  ) : (
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
