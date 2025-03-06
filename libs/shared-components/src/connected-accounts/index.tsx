import { ChainTypes, NearNetworks } from '@mweb/backend'
import { useGetCAPairs } from '@mweb/react-engine'
import makeBlockie from 'ethereum-blockies-base64'
import React, { FC } from 'react'
import styled from 'styled-components'
import { ProfileAddress } from '../common/profile-address'
import { ProfileIcon } from '../common/profile-icon'
import { ProfileInfo } from '../common/profile-info'
import { ProfileNetwork } from '../common/profile-network'
import ConnectModule from './connect-module'
import CAListItem from './connected-account-list-item'

const NoAccountsMessage = styled.div`
  font-size: 13px;
  font-weight: 400;
  line-height: 150%;
  color: rgba(122, 129, 139, 1);
`

const AccountsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 10px;
  border-radius: 10px;
  padding: 10px !important;
  background: rgba(248, 249, 255, 1);
`

const Wallet = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
`

const showChain = (chain: ChainTypes) => {
  if (chain === ChainTypes.ETHEREUM_SEPOLIA || chain === ChainTypes.ETHEREUM_XDAI) {
    return 'Ethereum • MetaMask'
  }
  if (chain === ChainTypes.NEAR_MAINNET) {
    return 'NEAR-Mainnet • MyNearWallet'
  }
  if (chain === ChainTypes.NEAR_TESTNET) {
    return 'NEAR-Testnet • MyNearWallet'
  }
  return ''
}

export const ConnectedAccount: FC<{
  loggedInNearAccountId: string | null
  nearNetwork: NearNetworks
  accountId: string
  chain: ChainTypes
  trackingRefs?: Set<React.RefObject<HTMLDivElement>>
  profileRef: React.RefObject<HTMLDivElement>
  socialAccount: {
    name: string
    origin: string
    fullname: string
    websiteName: string
  } | null
  showModal: boolean
}> = ({
  loggedInNearAccountId,
  nearNetwork,
  accountId,
  chain,
  trackingRefs,
  profileRef,
  socialAccount,
  showModal,
}) => {
  const { connectedAccountsPairs: pairs } = useGetCAPairs({
    chain,
    accountId,
  })
  return (
    <AccountsWrapper data-testid="connected-accounts-module">
      <Wallet>
        <ProfileIcon size="medium">
          <img src={makeBlockie(accountId)} alt="account blockie image" />
        </ProfileIcon>
        <ProfileInfo>
          <div style={{ display: 'flex', overflow: 'hidden', width: '100%' }}>
            <ProfileAddress
              styles={{ width: 'auto', textOverflow: 'ellipsis', overflow: 'hidden' }}
            >
              {accountId.slice(0, -5)}
            </ProfileAddress>
            <ProfileAddress styles={{ width: 'auto', flexShrink: 0 }}>
              {accountId.slice(-5)}
            </ProfileAddress>
          </div>
          <ProfileNetwork>{showChain(chain)}</ProfileNetwork>
        </ProfileInfo>
      </Wallet>
      {!pairs || pairs.length === 0 ? (
        <NoAccountsMessage>
          There are no connected accounts yet. You can connect your{' '}
          <a href="https://x.com" target="_blank">
            X
          </a>{' '}
          and{' '}
          <a href="https://github.com" target="_blank">
            GitHub
          </a>{' '}
          accounts. Go to these resources and follow the instructions.
        </NoAccountsMessage>
      ) : (
        <>
          {showModal && loggedInNearAccountId ? (
            <ConnectModule
              nearNetwork={nearNetwork as NearNetworks}
              loggedInAccountId={loggedInNearAccountId}
              socialAccount={socialAccount}
            />
          ) : null}
          {pairs.map((x, i) => (
            <CAListItem
              key={x.secondAccount.name + x.secondAccount.origin}
              user={x.secondAccount}
              trackingRefs={trackingRefs}
              nearNetwork={nearNetwork}
              loggedInNearAccountId={loggedInNearAccountId}
              socialAccount={socialAccount}
              profileRef={profileRef}
            />
          ))}
        </>
      )}
    </AccountsWrapper>
  )
}
