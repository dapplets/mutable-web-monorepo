import { NearNetworks } from '@mweb/backend'
import React, { FC } from 'react'
import { useNavigate } from 'react-router'
import styled from 'styled-components'
import { ArrowIcon } from '../assets/icons'
import { ConnectedAccount } from '../../connected-accounts'
import { useEngine } from '../../contexts/engine-context'

const ProfileContainer = styled.div`
  --primary: oklch(53% 0.26 269.37); // rgb(56, 75, 255)
  --primary-hover: oklch(47.4% 0.2613 267.51); // rgb(36, 55, 235)
  --primary-pressed: oklch(42.2% 0.2585 265.62); // rgb(16, 35, 215)
  --pure-white: white;

  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 0;
  gap: 10px;

  .list {
    position: absolute;
    right: 6px;
    z-index: 1;
    padding: 8px;
    background: var(--pure-white);
    border-radius: 8px;
    box-shadow:
      0px 4px 20px 0px rgba(11, 87, 111, 0.149),
      0px 4px 5px 0px rgba(45, 52, 60, 0.102);

    ul,
    li {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    button {
      border: none;
      background: none;
      margin: 4px;
      padding: 2px;
      transition: color 0.1s ease;

      :hover {
        color: var(--primary-hover);
      }

      :active {
        color: var(--primary-pressed);
      }
    }
  }
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
  trackingRefs?: Set<React.RefObject<HTMLDivElement>>
}> = ({ trackingRefs }) => {
  const { loggedInAccountId, nearNetwork } = useEngine()
  const navigate = useNavigate()
  const profileRef = React.useRef<HTMLDivElement>(null)

  return (
    <ProfileContainer ref={profileRef} data-testid="profile-page">
      <Header>
        <BackButton onClick={() => navigate('/main')}>
          <ArrowIcon />
        </BackButton>
        <H1>Profile</H1>
      </Header>
      {loggedInAccountId ? (
        <ConnectedAccount
          loggedInAccountId={loggedInAccountId}
          nearNetwork={nearNetwork as NearNetworks}
          trackingRefs={trackingRefs}
          profileRef={profileRef}
        />
      ) : null}
    </ProfileContainer>
  )
}

export default Profile
