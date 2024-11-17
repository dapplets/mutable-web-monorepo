import React, { FC, useMemo, useRef, useState } from 'react'
import { Space, Typography, Spin, Flex } from 'antd'
import styled from 'styled-components'
import { MutationEditorModal } from './components/mutation-editor-modal'
import { useMutableWeb } from '@mweb/engine'
import { Dropdown } from './components/dropdown'
import { EntitySourceType } from '@mweb/backend'

const { Text } = Typography

const FeedContainer = styled(Space)`
  overflow: hidden;
  overflow-y: auto;
  height: auto;
  transition: all 0.2s ease;
  width: 100%;
  gap: 10px;
`

const SpinContainer = styled(Flex)`
  transition: all 0.2s ease;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`

const Loader = () => (
  <SpinContainer prefixCls="spin">
    <Spin size="large" />
  </SpinContainer>
)

const MultitablePanel: FC<{
  loggedInAccountId: string
  connectWallet: (() => Promise<void>) | undefined
}> = ({ loggedInAccountId, connectWallet }) => {
  const { mutations, allApps, selectedMutation, config } = useMutableWeb()
  const [isWaiting, setWaiting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const overlayRef = useRef<HTMLDivElement>(null)

  const handleSignIn = async () => {
    setWaiting(true)
    try {
      connectWallet && (await connectWallet())
    } finally {
      setWaiting(false)
    }
  }

  const handleMutateButtonClick = () => {
    setIsModalOpen(true)
  }
  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  return (
    <FeedContainer prefixCls="notifyWrapper" direction="vertical" ref={overlayRef}>
      {/* {isLoading || isWaiting || isViewAllLoading ? (
        <Loader />
      ) : !loggedInAccountId ? (
        <Text type="secondary">
          {!!connectWallet ? (
            <Button style={{ padding: ' 4px 4px' }} type="link" onClick={handleSignIn}>
              Login
            </Button>
          ) : (
            'Login '
          )}
          to see more notifications
        </Text>
      ) : (
        <>
      
        </>
      )} */}
      {isModalOpen ? (
        <></>
      ) : (
        // <MutationEditorModal
        //   loggedInAccountId={loggedInAccountId}
        //   apps={allApps}
        //   baseMutation={selectedMutation}
        //   localMutations={mutations.filter((m) => m.source === EntitySourceType.Local)}
        //   onClose={handleModalClose}
        // />
        <Dropdown onMutateButtonClick={handleMutateButtonClick} />
      )}
    </FeedContainer>
  )
}

export default MultitablePanel
