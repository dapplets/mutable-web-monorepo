import { NearNetworks } from '@mweb/backend'
import { useGetCAPairs } from '@mweb/react-engine'
import { IContextNode } from '@mweb/core'
import cn from 'classnames'
import React, { FC, useEffect, useState } from 'react'
import styled from 'styled-components'
import ConnectModule from './connect-module'
import CAListItem from './connected-account-list-item'
import { Message } from './message'
import { useEngine } from '../contexts/engine-context'
// import { TabLoader } from './tab-loader'

const ConnectedAccountsContainer = styled.div`
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

  --font-default: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
    'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
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

  display: flex;
  flex-direction: column;
  gap: 10px;
  height: calc(100vh - 183px);

  .warningInfo {
    display: block;
    margin: 0 10px;
    padding: 4px;
    color: white;
    text-align: center;
    background-color: var(--primary);
    border-radius: 10px;
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    justify-content: space-between;
    align-items: center;
    width: calc(100% - 20px);
    max-height: 100%;
    border-radius: 10px;
    margin: 0 10px;
    padding: 10px;
    padding-left: 0;
    background: #fff;
    font-family: var(--font-default);
    box-shadow:
      0px 4px 20px 0px #0b576f26,
      0px 4px 5px 0px #2d343c1a;
    overflow: hidden;
  }

  .caHeaderTop {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .caHeaderTop > h3 {
    margin: 5px 0;
    color: rgb(145 145 145);
  }

  .header {
    user-select: none;
    display: flex;

    // & > div:first-child {
    //   width: 64%;
    // }

    & > div {
      width: 100%;
    }
  }

  .scrollContent {
    display: flex;
    flex-direction: column;
    gap: 10px;
    direction: rtl;
    overflow-y: auto;
    height: auto;
    min-height: 156px;
    max-height: calc(100vh - 187px);
    padding-left: 7px;

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

    &.withWarning {
      max-height: calc(100vh - 215px);
    }

    &:first-child {
      margin-top: 0;
    }
  }

  .scrollContent > * {
    direction: ltr;
  }

  .accountsWrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    padding-left: 3px;
  }

  /* .mainBlock {
    display: grid;
    grid-template-columns: 333px 90px;
    align-items: center;
    margin-top: 10px;

    width: 100%;

    &:first-child {
      margin-top: 0;
    }
  } */

  .accountBlock {
    display: flex;
    width: 100%;
    padding: 10px;
    background-color: var(--web-bg);
    gap: 8px;
    border-radius: 32px;
  }

  .accountBlockHorizontal {
    flex-direction: row;
  }

  .accountBlockVertical {
    flex-direction: column;
  }

  .account {
    cursor: pointer;

    position: relative;

    display: flex;
    align-items: center;

    width: fit-content;
    height: 44px;
    margin: 3px;
    padding: 0 5px 0 2px;

    background: white;
    border-radius: 200px 140px 140px 200px;
  }

  .nameUser {
    flex-grow: 1;
    font-size: 14px;
    font-weight: 400;
    font-style: normal;
  }

  .nameUserActive {
    background: var(--primary) !important;

    .nameUser {
      color: var(--pure-white) !important;
    }
  }

  .accountStatus {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    height: 100%;

    background-color: #dadada;
  }

  .statusLabel {
    display: block;

    width: 30px;
    height: 30px;

    border-radius: 50%;
    box-shadow: 0 2px 2px rgb(0 0 0 / 10%);
  }

  .accountStatus > div::before {
    content: attr(data-title);

    position: absolute;
    z-index: 9998;
    top: 47%;
    right: 87%;

    display: none;

    width: max-content;
    height: auto;
    padding: 8px 10px;

    font-size: 10px;
    font-weight: 400;
    font-style: normal;
    line-height: 100%;
    color: var(--main-grey);
    text-align: center;
    text-transform: capitalize;

    background: var(--pure-white);
    border-radius: 10px 0 10px 10px;
    box-shadow: 0 4px 4px rgb(0 0 0 / 10%);
  }

  .accountStatus > div:hover::before,
  .accountStatus > div:focus::before {
    display: inline-block;
  }

  .statusName {
    display: inline-block;

    padding-left: 5px;

    font-size: 10px;
    font-weight: 400;
    font-style: normal;
    line-height: 100%;
    color: var(--main-black);
    text-transform: capitalize;
  }

  .statusConnected {
    margin: 3px;
    padding: 4px 5px;
    background: #5ec280;
  }

  .statusProcessing {
    margin: 3px;
    padding: 6px 5px;
    background: #f5cf6c;
  }

  .statusError {
    margin: 3px;
    padding: 4px 2px 7px;
    background: var(--primary);
  }

  .buttonDelete {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 30px;
    height: 30px;
    margin: 3px;

    background-color: var(--pure-white);
    filter: drop-shadow(0 2px 2px rgb(0 0 0 / 4%));
    border-radius: 50%;

    fill: #919191;

    &:hover {
      background-color: var(--primary);
      fill: #fff;
    }

    &:active {
      background-color: var(--primary-pressed);
      fill: #fff;
    }

    &:disabled {
      cursor: default;
      background-color: #e5e5e5;
      fill: #919191;
    }
  }

  .buttonDelete svg {
    fill: inherit;
  }

  .noAccounts {
    padding: 16px 10px 24px;

    h6 {
      font-size: 22px;
      font-weight: 700;
      font-style: normal;
      line-height: 26px;
      color: var(--main-grey);
      text-align: center;
      padding: 0 0 16px !important;
    }

    p {
      font-size: 14px;
      font-weight: 500;
      font-style: normal;
      line-height: 16px;
      color: #797979;
      text-align: center;
    }
  }

  .connectWalletsBtnModule {
    display: flex;
    align-items: center;
    width: 44%;
  }

  .connectWalletsBtn {
    display: block;

    width: fit-content;
    margin-left: 10px;
    padding: 15px 20px;

    font-size: 14px;
    line-height: 100%;
    color: #fff;

    background: var(--primary);
    border-radius: 12px;

    &:hover {
      background: #c12f49;
    }

    &:active {
      background: var(--primary-pressed);
    }

    &:disabled {
      cursor: default;
      background-color: var(--main-grey);
    }
  }

  .connectWalletsBtnInfo {
    display: block;

    width: 20px;
    height: 20px;
    margin-left: 8px;

    border-radius: 99px;
  }

  .connectWalletsBtnInfo svg {
    fill: #c9c9c9;

    &:hover,
    &:focus {
      fill: #adadad;
    }

    &:active {
      fill: var(--main-grey);
    }
  }

  .connectWalletsBtnInfo.active svg {
    fill: var(--primary);

    &:hover,
    &:focus {
      fill: #c12f49;
    }

    &:active {
      fill: var(--primary-pressed);
    }
  }

  .connectWalletsInfoWrapper {
    position: absolute;
    z-index: 2;
    right: 0;
    height: 0;
  }

  .connectWalletsInfo {
    transform: translateX(200%);

    display: block;

    width: 296px;
    margin-top: 4px;
    margin-right: 10px;
    padding: 13px 16px;

    font-size: 14px;
    font-weight: 400;
    font-style: normal;
    line-height: 149%;
    color: var(--content-black);

    opacity: 0;
    background: white;
    border-radius: 20px;
    box-shadow: 0 2px 12px rgb(0 0 0 / 25%);

    transition:
      transform 0.01s ease-out 0.2s,
      opacity 0.2s ease-out 0s;
  }

  .connectWalletsInfoVisible {
    transform: translateX(0);
    opacity: 1;
    transition:
      transform 0.01s ease-in 0s,
      opacity 0.2s ease-in 0s;
  }

  .connectWalletsInfo p:first-child {
    margin-bottom: 10px;
  }
`

export const ConnectedAccount: FC<{
  loggedInAccountId: string
  nearNetwork: NearNetworks
  trackingRefs?: Set<React.RefObject<HTMLDivElement>>
  profileRef: React.RefObject<HTMLDivElement>
}> = ({ loggedInAccountId, nearNetwork, trackingRefs, profileRef }) => {
  // const [isLoadingListDapplets, setLoadingListDapplets] = useState(true)
  const { connectedAccountsPairs: pairs } = useGetCAPairs({
    networkId: nearNetwork,
    accountId: loggedInAccountId,
  })
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

  // const getCAPendingRequest = async (
  //   accountGId: string
  // ): Promise<{
  //   pendingRequest: TConnectedAccountsVerificationRequestInfo | null
  //   pendingRequestId: number
  // }> => {
  //   const pendingRequestsIds = await getPendingRequests()
  //   if (pendingRequestsIds && pendingRequestsIds.length) {
  //     for (const id of pendingRequestsIds) {
  //       const request = await getVerificationRequest(id)
  //       if (
  //         request &&
  //         (request.firstAccount === accountGId || request.secondAccount === accountGId)
  //       ) {
  //         return { pendingRequest: request, pendingRequestId: id }
  //       }
  //     }
  //   }
  //   return { pendingRequest: null, pendingRequestId: -1 }
  // }

  return (
    <ConnectedAccountsContainer data-testid="connected-accounts-module">
      {nearNetwork === NearNetworks.Testnet && (
        <div className="warningInfo">Connected Accounts are using a test network</div>
      )}
      <ConnectModule
        nearNetwork={nearNetwork}
        loggedInAccountId={loggedInAccountId}
        socialAccount={socialAccount}
      />
      {/* {isLoadingListDapplets ? (
        <TabLoader />
      ) : ( */}
      <div className="wrapper">
        {!pairs || pairs.length === 0 ? (
          <Message
            className="noAccounts"
            title={'There are no connected accounts'}
            subtitle={
              <p>
                {!loggedInAccountId
                  ? 'Connect your wallet to see connected accounts'
                  : 'You can connect your X and GitHub accounts. Go to these resources and follow the instructions.'}
              </p>
            }
          />
        ) : (
          <div className="accountsWrapper">
            <div
              className={cn('scrollContent', {
                withWarning: nearNetwork === NearNetworks.Testnet,
              })}
            >
              {pairs.map((x, i) => (
                <CAListItem
                  key={x.secondAccount.name + x.secondAccount.origin}
                  user={x.secondAccount}
                  trackingRefs={trackingRefs}
                  nearNetwork={nearNetwork}
                  loggedInAccountId={loggedInAccountId}
                  socialAccount={socialAccount}
                  profileRef={profileRef}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      {/* )} */}
    </ConnectedAccountsContainer>
  )
}
