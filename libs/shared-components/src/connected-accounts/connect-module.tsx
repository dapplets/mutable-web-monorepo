import { NearNetworks } from '@mweb/backend'
import { RequestStatus, useConnectedAccounts, useConnectionRequest } from '@mweb/engine'
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
  gap: ${(props) =>
    props.$status === RequestStatus.CLAIMING ||
    props.$status === RequestStatus.VERIFICATION ||
    props.$status === RequestStatus.SUCCESS
      ? '0'
      : '10px'};
`

const Header = styled.div<{ $status: RequestStatus }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  transition:
    height 0.3s ease,
    transform 0.1s ease;
  height: ${(props) =>
    props.$status === RequestStatus.CLAIMING ||
    props.$status === RequestStatus.VERIFICATION ||
    props.$status === RequestStatus.SUCCESS
      ? '0'
      : '22px'};
  transform: ${(props) =>
    props.$status === RequestStatus.CLAIMING ||
    props.$status === RequestStatus.VERIFICATION ||
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

const Text = styled.p<{ $status: RequestStatus }>`
  font-family: var(--font-default);
  color: ${({ $status }) => ($status === RequestStatus.FAILED ? 'var(--error)' : 'var(--gray)')};
  font-size: 12px !important;
  font-weight: 400 !important;
  line-height: 150%;
  transition: all 0.15s ease;
  height: ${(props) =>
    props.$status === RequestStatus.CLAIMING ||
    props.$status === RequestStatus.VERIFICATION ||
    props.$status === RequestStatus.SUCCESS
      ? '0'
      : props.$status === RequestStatus.FAILED
        ? '20px'
        : '54px'};
  transform: ${(props) =>
    props.$status === RequestStatus.CLAIMING ||
    props.$status === RequestStatus.VERIFICATION ||
    props.$status === RequestStatus.SUCCESS
      ? 'scaleY(0)'
      : 'scaleY(1)'};
`

type ConnectModuleProps = {
  nearNetwork: NearNetworks
  loggedInAccountId: string
  socialAccount: {
    name: string
    origin: string
    fullname: string
    websiteName: string
  } | null
}

const ConnectModule: FC<ConnectModuleProps> = ({
  nearNetwork,
  loggedInAccountId,
  socialAccount,
}) => {
  const { connectedAccountsNet, requests, socialNetworkConnectionCondition } =
    useConnectedAccounts()
  const { makeConnectionRequest } = useConnectionRequest()
  const [showConnectModule, setShowConnectModule] = useState(false)
  const [accountToConnect, setAccountToConnect] = useState<{
    name: string
    origin: string
    fullname: string
    websiteName: string
  } | null>(null)
  const [isConditionDone, setIsConditionDone] = useState(false)

  useEffect(() => {
    if (
      !socialAccount ||
      connectedAccountsNet?.includes(`${socialAccount.name}/${socialAccount.origin}`)
    ) {
      setAccountToConnect(null)
      setShowConnectModule(false)
      setIsConditionDone(false)
      return
    }

    if (
      !accountToConnect ||
      socialAccount.name !== accountToConnect.name ||
      socialAccount.origin !== accountToConnect.origin ||
      socialAccount.fullname !== accountToConnect.fullname
    ) {
      setAccountToConnect({ ...socialAccount })
      setShowConnectModule(true)
      const proofUrl = `https://${socialAccount.origin.toLowerCase()}.com/` + socialAccount.name // ToDo: can be different URLs + less secure
      setIsConditionDone(() =>
        !!loggedInAccountId
          ? socialNetworkConnectionCondition({
              socNet_id: socialAccount.name,
              near_id: loggedInAccountId,
              url: proofUrl,
              fullname: socialAccount.fullname,
            })
          : true
      )
    }
  }, [socialAccount, connectedAccountsNet])

  if (!showConnectModule || !accountToConnect) return null

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
            disabled={!isConditionDone || !loggedInAccountId}
          />
        )}
      </AccountListItem>
      <Text $status={status}>
        {!loggedInAccountId
          ? 'To link your source account, you need to connect your wallet first.'
          : request?.message
            ? 'The transaction is rejected' // ToDo: process diffenent messages
            : !isConditionDone
              ? `You are on a website for which account linking is available. Copy your logged-in NEAR address and add it to your ${accountToConnect.websiteName} account name.`
              : `The condition for account linking is met. Click on the Link button above to connect your ${accountToConnect.websiteName} account to your current NEAR wallet.`}
      </Text>
    </Wrapper>
  )
}

export default ConnectModule
