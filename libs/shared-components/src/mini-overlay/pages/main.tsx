import { Button, Space, Typography } from 'antd'
import React, { FC } from 'react'
import MultitablePanel from '../../multitable-panel'
import NotificationFeed from '../../notifications/notification-feed'
import { Close as CloseIcon } from '../assets/icons'
import styled from 'styled-components'
const { Title, Text } = Typography

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

export interface IMainProps {
  loggedInAccountId: string
  modalContainerRef: React.RefObject<HTMLElement>
  handleMutateButtonClick: () => void
  onClose: () => void
  connectWallet: () => Promise<void>
}
const Main: FC<IMainProps> = ({
  loggedInAccountId,
  modalContainerRef,
  handleMutateButtonClick,
  onClose,
  connectWallet,
}) => {
  return (
    <MainContainer data-testid="main-page">
      <MultitablePanel
        connectWallet={connectWallet}
        loggedInAccountId={loggedInAccountId}
        handleMutateButtonClick={handleMutateButtonClick}
      />
      {loggedInAccountId ? (
        <NotificationFeed
          connectWallet={connectWallet}
          loggedInAccountId={loggedInAccountId}
          modalContainerRef={modalContainerRef}
        />
      ) : (
        <Space
          direction="vertical"
          style={{
            width: '100%',
            borderRadius: '20px',
            background: '#fff',
            padding: '8px 8px 20px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Space direction="horizontal" style={{ width: '100%', display: 'flex' }}>
            <Title style={{ userSelect: 'none', margin: '0 auto' }} level={3}>
              Sign in
            </Title>

            <Button
              type="text"
              style={{
                marginLeft: 'auto',
                position: 'absolute',
                right: '8px',
                top: '8px',
              }}
              onClick={onClose}
            >
              <CloseIcon />
            </Button>
          </Space>

          <Text
            type="secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '5px',
              textAlign: 'center',
              fontSize: '12px',
            }}
          >
            To see personalized notifications, you must sign in by connecting your wallet.
          </Text>
        </Space>
      )}
    </MainContainer>
  )
}

export default Main
