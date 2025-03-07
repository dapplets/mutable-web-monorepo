import { ChainTypes, NearNetworks } from '@mweb/backend'
import { IContextNode } from '@mweb/core'
import React, { FC, useEffect, useState } from 'react'
import styled from 'styled-components'
import { ConnectedAccount } from '../../connected-accounts'
import { useEngine } from '../../contexts/engine-context'
import PageLayout from '../components/page-layout'

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
  const { loggedInAccountId, nearNetwork, addresses, onConnectEthWallet, walletChainId } =
    useEngine()
  const profileRef = React.useRef<HTMLDivElement>(null)

  console.log('addresses', addresses)
  console.log('walletChainId', walletChainId)

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
    <PageLayout ref={profileRef} title="Profile">
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
          {/* ToDo: hardcoded */}
          {addresses?.length ? (
            addresses.map((addr) => (
              <ConnectedAccount
                key={addr}
                loggedInNearAccountId={loggedInAccountId}
                nearNetwork={nearNetwork as NearNetworks}
                accountId={addr}
                chain={ChainTypes.ETHEREUM_SEPOLIA} // ToDo: hardcoded
                trackingRefs={trackingRefs}
                profileRef={profileRef}
                socialAccount={socialAccount}
                showModal={false}
              />
            ))
          ) : (
            <ConnectMetamaskButton onClick={onConnectEthWallet}>
              <div>+</div>Connect MetaMask
            </ConnectMetamaskButton>
          )}
        </ScrollContent>
      </Main>
    </PageLayout>
  )
}

export default Profile
