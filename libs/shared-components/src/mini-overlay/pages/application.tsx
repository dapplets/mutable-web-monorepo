import {
  JobsProvider,
  useGetMutationVersion,
  useGetSelectedMutation,
  useJobs,
  useMutation,
  useMutationApps,
  usePreferredSource,
} from '@mweb/react-engine'
import { Empty, Typography } from 'antd'
import React, { FC } from 'react'
import { useParams } from 'react-router'
import styled from 'styled-components'
import { Image } from '../../common/image'
import { useEngine } from '../../contexts/engine-context'
import PageLayout from '../components/page-layout'

const AigencyContainer = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  border-radius: 10px;
  background: rgba(255, 255, 255, 1);

  align-items: flex-start;
  width: calc(100% - 20px);
  padding: 10px;
  gap: 10px;
  max-height: calc(100vh - 150px);
  overflow-y: auto;
  overflow-x: hidden;

  font-family: system-ui, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
    'Helvetica Neue', sans-serif;

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
`

const Title = styled.div`
  font-weight: 600;
  font-size: 14px;
  line-height: 20.86px;
  letter-spacing: 0%;
  color: rgba(2, 25, 58, 1);
`

const AgentCard = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  width: calc(100% - 10px);
  background: rgba(248, 249, 255, 1);
  border-radius: 10px;
  border-bottom-width: 1px;
  padding: 6px;
  gap: 6px;
`

const MutationIconWrapper = styled.button<{ $isStopped?: boolean; $isButton: boolean }>`
  display: flex;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  width: 46px;
  height: 46px;
  outline: none;
  border: none;
  background: #fff;
  padding: 0;
  border-radius: 50%;
  transition: all 0.15s ease-in-out;
  position: relative;
  box-shadow: 0 4px 5px 0 rgba(45, 52, 60, 0.2);
  cursor: ${(props) => (props.$isButton ? 'pointer' : 'default !important')};

  .labelAppCenter {
    opacity: 0;
  }

  img {
    box-sizing: border-box;
    object-fit: cover;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    filter: ${(props) => (props.$isStopped ? 'grayscale(1)' : 'grayscale(0)')};
    transition: all 0.15s ease-in-out;
  }

  &:hover {
    box-shadow: ${(props) =>
      props.$isButton ? '0px 4px 20px 0px #0b576f26, 0px 4px 5px 0px #2d343c1a' : 'initial'};

    img {
      filter: ${(props) => (props.$isButton ? 'brightness(115%)' : 'none')};
    }
  }

  &:active {
    box-shadow: ${(props) =>
      props.$isButton ? '0px 4px 20px 0px #0b576f26, 0px 4px 5px 0px #2d343c1a' : 'initial'};

    img {
      filter: ${(props) => (props.$isButton ? 'brightness(125%)' : 'none')};
    }
  }

  &:hover .labelAppTop {
    opacity: ${(props) => (props.$isStopped ? '0' : '1')};
  }

  &:hover .labelAppCenter {
    opacity: 1;
  }
`

const CardContent = styled.div`
  flex: 1 0;
`

const nearIcon = (
  <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7.51183 1.25893L5.771 3.84226C5.65183 4.02059 5.88391 4.22893 6.05058 4.08309L7.5685 2.59518C7.61308 2.55643 7.6785 2.58309 7.6785 2.64851V7.30643C7.6785 7.36893 7.59516 7.39559 7.55975 7.35101L2.571 1.14851C2.48962 1.04836 2.38661 0.967955 2.2697 0.913326C2.15279 0.858697 2.02503 0.831266 1.896 0.833093C1.36016 0.833093 0.833496 1.10393 0.833496 1.72309V8.27351C0.834735 8.46645 0.898643 8.65377 1.01559 8.80724C1.13254 8.9607 1.29619 9.07201 1.4819 9.12438C1.6676 9.17676 1.8653 9.16736 2.0452 9.09761C2.2251 9.02786 2.37746 8.90154 2.47933 8.73768L4.21725 6.15434C4.33641 5.97601 4.10725 5.76768 3.94058 5.91351L2.43183 7.43143C2.38725 7.47018 2.32141 7.44309 2.32141 7.37768V2.73184C2.32141 2.66643 2.40475 2.64268 2.44058 2.68726L7.41975 8.85101C7.58641 9.05643 7.83641 9.16643 8.09516 9.16643C8.63391 9.16643 9.16683 8.89851 9.16683 8.27643V1.72643C9.16667 1.53181 9.10293 1.34257 8.9853 1.18752C8.86768 1.03246 8.70262 0.920083 8.51524 0.867483C8.32786 0.814884 8.12843 0.824944 7.9473 0.896132C7.76617 0.967321 7.61325 1.09574 7.51183 1.26184V1.25893Z"
      fill="#19CEAE"
    />
  </svg>
)

type TTextLink = {
  bold?: boolean
  small?: boolean
  ellipsis?: boolean
  $color?: string
}

const TextLink = styled.div<TTextLink>`
  display: flex;
  gap: 3px;
  align-items: center;
  margin: 0;
  font-size: 14px;
  line-height: 18px;
  color: ${(p) =>
    p.$color
      ? `${p.$color} !important`
      : p.bold
        ? '#11181C !important'
        : 'rgb(146 154 160) !important'};
  font-weight: 600;
  font-size: ${(p) => (p.small ? '12px' : '14px')};
  overflow: ${(p) => (p.ellipsis ? 'hidden' : 'visible')};
  text-overflow: ${(p) => (p.ellipsis ? 'ellipsis' : 'unset')};
  white-space: nowrap;
  outline: none;

  span {
    color: rgba(25, 206, 174, 1);
  }
`

type Agent = {
  id: string
  metadata: {
    image: {
      ipfs_cid: string
    }
    name: string
  }
  total: number
  jobsCount: number
  maxRunAt: string
  minRunAt: string
  maxCreatedAt: string
  minCreatedAt: string
  maxLockedAt: string
  minLockedAt: string
}

// Utility function to format job count
const formatJobCount = (jobCount: number): string => {
  return `${jobCount} job${jobCount !== 1 ? 's' : ''}`
}

// Utility function to format time ago
const formatTimeAgo = (dateString: string): string => {
  const now = new Date()
  const past = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  const hours = Math.floor(diffInSeconds / 3600)
  const minutes = Math.floor((diffInSeconds % 3600) / 60)
  const seconds = diffInSeconds % 60

  const parts = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`)

  return parts.join(' ')
}

// ToDo: hardcoded AiAgent !!!
const AigencyPage: FC = () => {
  const {
    data: agents,
    error,
    isPending,
  }: { data: Agent[]; error: Error | null; isPending: boolean } = useJobs(
    'https://api.aigency.augm.link/scheduler/runners',
    'agents'
  )

  if (isPending) return 'Loading...'
  if (error) return 'An error has occurred: ' + error?.message
  if (!agents?.length)
    return (
      <AigencyContainer>
        <Title>No active agents</Title>
      </AigencyContainer>
    )

  return (
    <AigencyContainer>
      <Title>Active agents</Title>
      {agents.map((agent) => (
        <AgentCard key={agent.id}>
          <MutationIconWrapper $isButton={false}>
            <Image
              image={agent.metadata.image}
              fallbackUrl="https://ipfs.near.social/ipfs/bafkreifc4burlk35hxom3klq4mysmslfirj7slueenbj7ddwg7pc6ixomu"
              alt={agent.metadata.name}
            />
          </MutationIconWrapper>
          <CardContent>
            <TextLink bold ellipsis>
              {agent.metadata.name}
            </TextLink>
            <TextLink small ellipsis>
              {Math.round(agent.total * 100) ? (
                <>
                  {nearIcon}
                  <span>+{Math.round(agent.total * 100) / 100}</span> •{' '}
                </>
              ) : null}
              Running since {formatTimeAgo(agent.minRunAt)} • {formatJobCount(agent.jobsCount)}
            </TextLink>
          </CardContent>
        </AgentCard>
      ))}
    </AigencyContainer>
  )
}

const EmptyContainer = styled.div`
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

  return !selectedApp ? null : (
    <PageLayout ref={appRef} title={selectedApp.metadata.name || ''} backPath={-1}>
      {/* ToDo: hardcoded AiAgent !!! */}
      {selectedApp.id === 'bos.dapplets.testnet/app/AiAgent' ? (
        <JobsProvider>
          <AigencyPage />
        </JobsProvider>
      ) : (
        <EmptyContainer>
          <Empty
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            style={{ height: 60 }}
            description={
              <Typography.Text style={{ color: 'rgb(115 122 133)' }}>
                No content provided for this application
              </Typography.Text>
            }
          ></Empty>
        </EmptyContainer>
      )}
    </PageLayout>
  )
}

export default Application
