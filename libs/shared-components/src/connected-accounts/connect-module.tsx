import { NearNetworks } from '@mweb/backend'
import { RequestStatus, useConnectionRequest, useGetRequests } from '@mweb/react-engine'
import React, { FC } from 'react'
import styled from 'styled-components'
import { Close } from '../mini-overlay/assets/icons'
import AccountListItem from './account-list-item'
import LinkButton from './link-button'
import { StatusBadge } from './status-badge'

const Wrapper = styled.div<{ $status: RequestStatus }>`
  display: flex;
  flex-direction: column;
  width: 100% !important;
  padding: 10px !important;
  border-radius: 10px !important;
  background: var(--pure-white);
  transition: all 0.3s ease;
  gap: ${(props) =>
    props.$status === RequestStatus.SIGNING ||
    props.$status === RequestStatus.VERIFYING ||
    props.$status === RequestStatus.SUCCESS
      ? '0'
      : '10px'};
`

const Header = styled.div<{ $status: RequestStatus }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  transition: all 0.15s ease;
  opacity: ${({ $status }) =>
    $status === RequestStatus.SIGNING ||
    $status === RequestStatus.VERIFYING ||
    $status === RequestStatus.SUCCESS
      ? 0
      : 1};
  height: ${(props) =>
    props.$status === RequestStatus.SIGNING ||
    props.$status === RequestStatus.VERIFYING ||
    props.$status === RequestStatus.SUCCESS
      ? 0
      : 22};
  transform: ${(props) =>
    props.$status === RequestStatus.SIGNING ||
    props.$status === RequestStatus.VERIFYING ||
    props.$status === RequestStatus.SUCCESS
      ? 'scaleY(0)'
      : 'scaleY(1)'};
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

const Text = styled.div<{ $status: RequestStatus }>`
  font-family: var(--font-default);
  color: ${({ $status }) => ($status === RequestStatus.FAILED ? 'var(--error)' : 'var(--gray)')};
  font-size: 12px !important;
  font-weight: 400 !important;
  line-height: 150%;
  transition: all 0.15s ease;
  opacity: ${({ $status }) =>
    $status === RequestStatus.SIGNING ||
    $status === RequestStatus.VERIFYING ||
    $status === RequestStatus.SUCCESS
      ? 0
      : 1};
  height: ${({ $status }) =>
    $status === RequestStatus.SIGNING ||
    $status === RequestStatus.VERIFYING ||
    $status === RequestStatus.SUCCESS
      ? 0
      : $status === RequestStatus.FAILED
        ? 20
        : 'auto'};
  transform: ${({ $status }) =>
    $status === RequestStatus.SIGNING ||
    $status === RequestStatus.VERIFYING ||
    $status === RequestStatus.SUCCESS
      ? 'scaleY(0)'
      : 'scaleY(1)'};
`

type ConnectModuleProps = {
  accountToConnect: {
    name: string
    origin: string
    fullname: string
    websiteName: string
  }
  nearNetwork: NearNetworks
  loggedInAccountId: string | null
  isConditionDone: boolean
  onCloseModal: () => void
}

export const ConnectModule: FC<ConnectModuleProps> = ({
  accountToConnect,
  nearNetwork,
  loggedInAccountId,
  isConditionDone,
  onCloseModal,
}) => {
  const { requests } = useGetRequests()
  const { makeConnectionRequest } = useConnectionRequest()

  const request = requests.find(
    (r) =>
      r.type === 'connect' &&
      r.payload.has(`${accountToConnect.name}/${accountToConnect.origin.toLowerCase()}`)
  )
  const status = request?.status ?? RequestStatus.DEFAULT

  return (
    <Wrapper $status={status} data-status={status}>
      <Header $status={status}>
        <H3>You can link new account</H3>
        <ButtonClose onClick={onCloseModal}>
          <Close />
        </ButtonClose>
      </Header>
      <AccountListItem
        name={accountToConnect.name}
        origin={accountToConnect.origin.toLowerCase()}
        disabled={status === RequestStatus.SIGNING || status === RequestStatus.VERIFYING}
        bgColor="var(--muddy-white)"
      >
        {status !== RequestStatus.DEFAULT ? (
          <StatusBadge status={status} />
        ) : (
          <LinkButton
            onClick={() =>
              loggedInAccountId &&
              makeConnectionRequest({
                name: accountToConnect.name,
                origin: accountToConnect.origin.toLowerCase(),
                isUnlink: false,
                nearNetwork,
                loggedInAccountId,
              })
            }
            disabled={!isConditionDone || !loggedInAccountId}
          />
        )}
      </AccountListItem>
      <Text $status={status}>
        {!loggedInAccountId ? (
          <p>To link your source account, you need to connect your wallet first.</p>
        ) : request?.message ? (
          <p>The transaction is rejected</p> // ToDo: process diffenent messages
        ) : !isConditionDone ? (
          <>
            <p>
              You are on a website for which account linking is available. Copy your logged-in NEAR
              address and add it to your {accountToConnect.websiteName} account name.
            </p>
            <p>
              For example:{' '}
              <b>
                {accountToConnect.fullname} ({loggedInAccountId})
              </b>
            </p>
          </>
        ) : (
          <p>
            The condition for account linking is met. Click on the Link button above to connect your
            {accountToConnect.websiteName} account to your current NEAR wallet.
          </p>
        )}
      </Text>
    </Wrapper>
  )
}

export default ConnectModule
