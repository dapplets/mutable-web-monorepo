import { Space, Typography } from 'antd'
import React, { FC } from 'react'
import styled from 'styled-components'
import { useEngine } from '../../contexts/engine-context'
import NotificationFeed from '../../notifications/notification-feed'
import PageLayout from '../components/page-layout'

const { Title, Text } = Typography

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 0 10px;
  gap: 10px;
  max-height: calc(100vh - 129px);
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

const Notifications: FC = () => {
  const { loggedInAccountId, onConnectWallet } = useEngine()
  const ref = React.useRef<HTMLDivElement>(null)
  return (
    <PageLayout ref={ref} title="Notifications">
      <Wrapper>
        {loggedInAccountId ? (
          <NotificationFeed
            onConnectWallet={onConnectWallet}
            loggedInAccountId={loggedInAccountId}
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
      </Wrapper>
    </PageLayout>
  )
}

export default Notifications
