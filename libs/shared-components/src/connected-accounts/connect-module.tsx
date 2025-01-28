import { NearNetworks } from '@mweb/backend'
import { IContextNode } from '@mweb/core'
import { RequestStatus, useConnectedAccounts, useConnectionRequest } from '@mweb/engine'
import { useCore } from '@mweb/react'
import React, { FC, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Close } from '../mini-overlay/assets/icons'
import AccountListItem from './account-list-item'
import LinkButton from './link-button'
import { StatusBadge } from './status-badge'

const Wrapper = styled.div<{ $status: RequestStatus }>`
  display: flex;
  flex-direction: column;
  margin: 0 10px !important;
  width: calc(100% - 20px) !important;
  padding: 10px !important;
  border-radius: 10px !important;
  background: var(--pure-white);
  box-shadow:
    0px 4px 20px 0px rgba(11, 87, 111, 0.149),
    0px 4px 5px 0px rgba(45, 52, 60, 0.102);
  transition: all 0.3s ease;
  gap: ${(props) => (props.$status !== RequestStatus.DEFAULT ? '0' : '10px')};
`

const Header = styled.div<{ $status: RequestStatus }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  transition:
    height 0.3s ease,
    transform 0.1s ease;
  height: ${(props) => (props.$status !== RequestStatus.DEFAULT ? '0' : '22px')};
  transform: ${(props) => (props.$status !== RequestStatus.DEFAULT ? 'scaleY(0)' : 'scaleY(1)')};
`

const H3 = styled.h3`
  font-family: var(--font-default);
  color: var(--primary);
  font-size: 14px !important;
  font-weight: 600 !important;
  line-height: 150%;
`

const ButtonClose = styled.button`
  padding: 5px !important;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--gray);
  transition: var(--transition-default);

  &:hover {
    color: var(--gray-hover);
  }

  &:active {
    color: var(--gray-active);
  }
`

const Text = styled.p<{ $status: RequestStatus }>`
  font-family: var(--font-default);
  color: var(--gray);
  font-size: 12px !important;
  font-weight: 400 !important;
  line-height: 150%;
  transition:
    height 0.3s ease,
    transform 0.1s ease;
  height: ${(props) => (props.$status !== RequestStatus.DEFAULT ? '0' : '54px')};
  transform: ${(props) => (props.$status !== RequestStatus.DEFAULT ? 'scaleY(0)' : 'scaleY(1)')};
`

type ConnectModuleProps = {
  nearNetwork: NearNetworks
  loggedInAccountId: string
}

const ConnectModule: FC<ConnectModuleProps> = ({ nearNetwork, loggedInAccountId }) => {
  const core = useCore()
  const { connectedAccountsNet, requests } = useConnectedAccounts()
  const { makeConnectionRequest } = useConnectionRequest()
  const [showConnectModule, setShowConnectModule] = useState(false)
  const [contextInfoNode, setContextInfoNode] = useState<IContextNode | null>(null)
  const [accountToConnect, setAccountToConnect] = useState<{ name: string; origin: string } | null>(
    null
  )

  const updateConnectModule = () => {
    const siteSpecificContexts = core.tree?.children.filter(
      (c) => c.namespace !== 'engine' && c.namespace !== 'mweb'
    )
    const node = siteSpecificContexts?.find(
      (c) => c.parsedContext?.username && c.parsedContext?.fullname && c.parsedContext?.websiteName
    )

    if (node !== contextInfoNode) setContextInfoNode(node ?? null)
    if (
      !node ||
      connectedAccountsNet?.includes(
        `${node.parsedContext.username}/${node.parsedContext.websiteName.toLowerCase()}`
      )
    ) {
      setAccountToConnect(null)
      setShowConnectModule(false)
      return
    }

    if (
      node.parsedContext.username !== accountToConnect?.name ||
      node.parsedContext.websiteName !== accountToConnect?.origin
    ) {
      setAccountToConnect({
        name: node.parsedContext.username,
        origin: node.parsedContext.websiteName,
      })
      setShowConnectModule(true)
    }
  }

  useEffect(updateConnectModule, [loggedInAccountId, nearNetwork, connectedAccountsNet, core?.tree])

  useEffect(() => {
    const subscription = contextInfoNode?.on('contextChanged', () => updateConnectModule())
    return () => subscription?.remove()
  }, [contextInfoNode])

  useEffect(() => {
    const contextChangedSubscription = core.tree?.on('contextChanged', () => updateConnectModule())
    const childContextAddedSubscription = core.tree?.on('childContextAdded', () =>
      updateConnectModule()
    )
    return () => {
      contextChangedSubscription?.remove()
      childContextAddedSubscription?.remove()
    }
  }, [core])

  if (!showConnectModule || !accountToConnect) return null

  const status =
    requests.find(
      (r) =>
        r.type === 'connect' &&
        r.payload.has(`${accountToConnect.name}/${accountToConnect.origin.toLowerCase()}`)
    )?.status ?? RequestStatus.DEFAULT

  return (
    <Wrapper $status={status} data-status={status}>
      <Header $status={status}>
        <H3>You can link new account</H3>
        <ButtonClose onClick={() => setShowConnectModule(false)}>
          <Close />
        </ButtonClose>
      </Header>
      <AccountListItem
        name={accountToConnect.name}
        origin={accountToConnect.origin.toLowerCase()}
        disabled={status === RequestStatus.CLAIMING || status === RequestStatus.VERIFICATION}
      >
        {status !== RequestStatus.DEFAULT ? (
          <StatusBadge status={status} />
        ) : (
          <LinkButton
            onClick={() =>
              makeConnectionRequest({
                name: accountToConnect.name,
                origin: accountToConnect.origin.toLowerCase(),
                isUnlink: false,
                nearNetwork,
                loggedInAccountId,
              })
            }
            disabled={!loggedInAccountId}
          />
        )}
      </AccountListItem>
      <Text $status={status}>
        {!loggedInAccountId
          ? 'To link your source account, you need to connect your wallet first.'
          : 'You are on a website for which account linking is available. Do you want to link your account to your current cryptocurrency wallet?'}
      </Text>
    </Wrapper>
  )
}

export default ConnectModule
