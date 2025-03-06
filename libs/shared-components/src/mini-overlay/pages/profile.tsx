import { ChainTypes, NearNetworks } from '@mweb/backend'
import { IContextNode } from '@mweb/core'
import React, { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import styled from 'styled-components'
import { ConnectedAccount } from '../../connected-accounts'
import { useEngine } from '../../contexts/engine-context'
import { ArrowIcon } from '../assets/icons'

const ProfileContainer = styled.div`
  --primary: oklch(53% 0.26 269.37); // rgb(56, 75, 255)
  --primary-hover: oklch(47.4% 0.2613 267.51); // rgb(36, 55, 235)
  --primary-pressed: oklch(42.2% 0.2585 265.62); // rgb(16, 35, 215)

  --main-grey: rgb(145, 145, 145);
  --content-black: rgb(116, 115, 118);

  --gray: rgb(122, 129, 139);
  --gray-hover: rgb(69, 71, 75);
  --gray-active: rgb(21, 21, 22);

  --pure-white: white;
  --muddy-white: rgb(248, 249, 255);
  --web-bg: rgb(234, 240, 240);

  --pure-black: black;
  --main-black: rgb(2, 25, 58);

  --warning: rgba(246, 133, 27, 1);
  --success: rgba(25, 206, 174, 1);
  --error: rgba(217, 48, 79, 1);

  --font-default: system-ui, Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
    sans-serif;
  --transition-default: all 0.1s ease;

  * {
    margin: 0;
    padding: 0;
    border: 0;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :focus,
  :active {
    outline: none;
  }

  a:focus,
  a:active {
    outline: none;
  }

  input,
  button,
  textarea {
    font-family: inherit;
  }

  input::-ms-clear {
    display: none;
  }

  button {
    cursor: pointer;
  }

  button::-moz-focus-inner {
    padding: 0;
    border: 0;
  }

  /* stylelint-disable-next-line no-descending-specificity */
  a,
  a:visited {
    text-decoration: none;
  }

  a:hover {
    text-decoration: none;
  }

  ul {
    list-style: none;
  }

  li {
    list-style: none;
  }

  img {
    vertical-align: top;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-size: inherit;
    font-weight: 400;
  }

  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 0;
  gap: 10px;
  font-family: var(--font-default);
`

const Header = styled.header`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin: 0 10px;
`

const Main = styled.main`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: calc(100vh - 129px);
  overflow: auto;
  gap: 10px;
  background-color: var(--pure-white);
  border-radius: 10px;
  box-shadow:
    0px 4px 20px 0px #0b576f26,
    0px 4px 5px 0px #2d343c1a;
`

const ScrollContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  width: 100%;
  padding: 10px;

  &::-webkit-scrollbar {
    cursor: pointer;
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgb(244 244 244);
    background: linear-gradient(
      90deg,
      rgb(244 244 244 / 0%) 10%,
      rgb(227 227 227 / 100%) 50%,
      rgb(244 244 244 / 0%) 90%
    );
  }

  &::-webkit-scrollbar-thumb {
    width: 4px;
    height: 2px;
    margin-bottom: 15px;

    background: var(--primary);
    border-radius: 2px;
    box-shadow:
      0 2px 6px rgb(0 0 0 / 9%),
      0 2px 2px rgb(38 117 209 / 4%);
  }

  &:first-child {
    margin-top: 0;
  }
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
    color: rgb(64, 150, 255);
  }

  &:active {
    color: rgb(9, 88, 217);
  }
`

const H1 = styled.h1`
  margin: 0;
  color: #02193a;
  font-size: 22px !important;
  font-weight: 600 !important;
  line-height: 32.78px;
  text-align: center;
  text-underline-position: from-font;
  text-decoration-skip-ink: none;
`

const ConnectMetamaskButton = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 4px;
  border: none;
  background: none;
  transition: all 0.2s ease;
  color: var(--primary);

  & > div:first-child {
    display: flex;
    border-radius: 50%;
    border: 2px solid var(--primary);
    width: 16px;
    height: 16px;
    align-items: center;
    justify-content: center;
    line-height: 100%;
    font-weight: bold;
    font-size: 14px;
    font-family: var(--font-default);
  }

  &:hover {
    color: var(--primary-hover);
  }

  &:hover > div {
    color: var(--primary-hover);
    border: 2px solid var(--primary-hover);
  }

  &:active {
    color: var(--primary-pressed);
  }

  &:active > div {
    color: var(--primary-pressed);
    border: 2px solid var(--primary-pressed);
  }
`

const Profile: FC<{
  trackingRefs?: Set<React.RefObject<HTMLDivElement>>
}> = ({ trackingRefs }) => {
  const { loggedInAccountId, nearNetwork, address, onConnectEthWallet } = useEngine()
  const navigate = useNavigate()
  const profileRef = React.useRef<HTMLDivElement>(null)

  const [socialAccount, setSocialAccount] = useState<{
    name: string
    origin: string
    fullname: string
    websiteName: string
  } | null>(null)
  const [contextInfoNode, setContextInfoNode] = useState<IContextNode | null>(null)
  const { tree } = useEngine()

  const getSocialAccount = () => {
    const siteSpecificContexts = tree?.children.filter(
      (c) => c.namespace !== 'engine' && c.namespace !== 'mweb'
    )
    const node = siteSpecificContexts?.find(
      (c) => c.parsedContext?.username && c.parsedContext?.fullname && c.parsedContext?.websiteName // ToDo: think about the logic: there can be several adapter configs, including malicious ones
    )
    if (node !== contextInfoNode) setContextInfoNode(node ?? null)
    if (!node) setSocialAccount(null)
    else {
      const { username, fullname, websiteName } = node.parsedContext
      setSocialAccount({ name: username, fullname, origin: websiteName.toLowerCase(), websiteName })
    }
  }

  useEffect(() => {
    getSocialAccount()
    const contextChangedSubscription = tree?.on('contextChanged', () => getSocialAccount())
    const childContextAddedSubscription = tree?.on('childContextAdded', () => getSocialAccount())
    return () => {
      contextChangedSubscription?.remove()
      childContextAddedSubscription?.remove()
    }
  }, [tree])

  useEffect(() => {
    const subscription = contextInfoNode?.on('contextChanged', () => getSocialAccount())
    return () => subscription?.remove()
  }, [contextInfoNode])

  return (
    <ProfileContainer ref={profileRef} data-testid="profile-page">
      <Header>
        <BackButton onClick={() => navigate('/main')}>
          <ArrowIcon />
        </BackButton>
        <H1>Profile</H1>
      </Header>
      <Main>
        <ScrollContent>
          {loggedInAccountId ? (
            <ConnectedAccount
              loggedInNearAccountId={loggedInAccountId}
              nearNetwork={nearNetwork as NearNetworks}
              accountId={loggedInAccountId}
              chain={
                (nearNetwork as NearNetworks) === NearNetworks.Mainnet
                  ? ChainTypes.NEAR_MAINNET
                  : ChainTypes.NEAR_TESTNET
              }
              trackingRefs={trackingRefs}
              profileRef={profileRef}
              socialAccount={socialAccount}
              showModal={true}
            />
          ) : null}
          {address ? (
            <ConnectedAccount
              loggedInNearAccountId={loggedInAccountId}
              nearNetwork={nearNetwork as NearNetworks}
              accountId={address}
              chain={ChainTypes.ETHEREUM_SEPOLIA} // ToDo: hardcoded
              trackingRefs={trackingRefs}
              profileRef={profileRef}
              socialAccount={socialAccount}
              showModal={false}
            />
          ) : (
            <ConnectMetamaskButton onClick={onConnectEthWallet}>
              <div>+</div>Connect MetaMask
            </ConnectMetamaskButton>
          )}
        </ScrollContent>
      </Main>
    </ProfileContainer>
  )
}

export default Profile
