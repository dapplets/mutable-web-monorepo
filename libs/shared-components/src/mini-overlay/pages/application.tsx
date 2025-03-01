import {
  useGetMutationVersion,
  useGetSelectedMutation,
  useMutation,
  useMutationApps,
  usePreferredSource,
} from '@mweb/react-engine'
import { Empty, Typography } from 'antd'
import React, { FC } from 'react'
import { useParams } from 'react-router'
import styled from 'styled-components'
import { useEngine } from '../../contexts/engine-context'
import PageLayout from '../components/page-layout'

const EmptyContaibner = styled.div`
  display: flex;
  width: 100%;
  height: 50vh;
  justify-content: center;
  align-items: center;
`

const Application: FC = () => {
  const { tree } = useEngine()
  const { selectedMutationId } = useGetSelectedMutation(tree?.id)
  const { preferredSource } = usePreferredSource(selectedMutationId, tree?.id)
  const { mutationVersion } = useGetMutationVersion(selectedMutationId)
  const { mutation } = useMutation(selectedMutationId, preferredSource, mutationVersion)
  const { mutationApps } = useMutationApps(mutation?.id, mutation?.apps ?? [])
  const { authorId, localId } = useParams() as { authorId: string; localId: string }
  const appId = authorId + '/app/' + localId
  const selectedApp = mutationApps.find((app) => app.id === appId)
  const appRef = React.useRef<HTMLDivElement>(null)

  return (
    <PageLayout ref={appRef} title={selectedApp?.localId || ''} backPath={-1}>
      <EmptyContaibner>
        <Empty
          image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
          style={{ height: 60 }}
          description={
            <Typography.Text style={{ color: 'rgb(115 122 133)' }}>
              No content provided for this application
            </Typography.Text>
          }
        ></Empty>
      </EmptyContaibner>
    </PageLayout>
  )
}

export default Application
