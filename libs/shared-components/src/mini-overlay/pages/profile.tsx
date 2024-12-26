import { NearNetworks } from '@mweb/backend'
import React, { FC } from 'react'
import { NavigateFunction } from 'react-router'
import styled from 'styled-components'
import { ArrowIcon } from '../assets/icons'
import { ConnectedAccount } from '../../connected-accounts'

const ProfileContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 0;
  gap: 10px;
`

const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin: 0 10px;
`

const BackButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  width: 20px;
  height: 20px;
  padding: 0;
  color: rgba(122, 129, 139, 1);
  background: none;
  transform: rotate(90deg);
  transition: all 0.2s ease;

  &:hover {
    color: #4096ff;
  }

  &:active {
    color: #0958d9;
  }
`

const H1 = styled.h1`
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
    'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  color: #02193a;
  font-size: 22px;
  font-weight: 600;
  line-height: 32.78px;
  text-align: center;
  text-underline-position: from-font;
  text-decoration-skip-ink: none;
`

const Profile: FC<{
  navigate: NavigateFunction
  loggedInAccountId: string
  nearNetwork: string
  trackingRefs?: Set<React.RefObject<HTMLDivElement>>
}> = ({ navigate, loggedInAccountId, nearNetwork, trackingRefs }) => {
  return (
    <ProfileContainer data-testid="profile-page">
      <Header>
        <BackButton onClick={() => navigate('/system/main')}>
          <ArrowIcon />
        </BackButton>
        <H1>Profile</H1>
      </Header>
      <ConnectedAccount
        loggedInAccountId={loggedInAccountId}
        nearNetwork={nearNetwork as NearNetworks}
        trackingRefs={trackingRefs}
      />
    </ProfileContainer>
  )
}

export default Profile
