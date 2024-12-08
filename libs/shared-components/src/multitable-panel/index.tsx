import { useNotifications, useViewAllNotifications } from '@mweb/engine'
import React, { FC, useMemo, useRef, useState } from 'react'
import { Space, Typography, Spin, Flex } from 'antd'
import styled from 'styled-components'

import { Dropdown } from './components/dropdown'

const { Text } = Typography

const FeedContainer = styled(Space)`
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
  handleMutateButtonClick: () => void
}> = ({ loggedInAccountId, connectWallet, handleMutateButtonClick }) => {
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
      <Dropdown onMutateButtonClick={handleMutateButtonClick} />
    </FeedContainer>
  )
}

export default MultitablePanel
