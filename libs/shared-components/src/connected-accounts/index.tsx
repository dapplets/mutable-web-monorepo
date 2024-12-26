import cn from 'classnames'
import { FC, useEffect, useState } from 'react'
// import browser from 'webextension-polyfill'
// import * as EventBus from '../../../../../common/global-event-bus'
import styled from 'styled-components'
import useAbortController from '../hooks/use-abort-controller'
import { Attention, Ok, Time, Trash } from './assets/icons'
import { CAUserButton } from './connected-accounts-button'
// import { DropdownCAListReceiver } from './dropdown-ca-list-receiver'
import {
  ConnectedAccountsPairStatus,
  IConnectedAccountsPair,
  IConnectedAccountUser,
  NearNetworks,
  WalletDescriptorWithCAMainStatus,
} from '@mweb/backend'
import { useChangeCAStatus, useConnectedAccounts } from '@mweb/engine'
import { Message } from './message'
import { resources } from './resources'
import { TabLoader } from './tab-loader'

const ConnectedAccountsContainer = styled.div`
  --primary: rgba(56, 75, 255, 1);
  --primary-pressed: rgba(56, 75, 255, 0.5);
  --main-grey: #919191;
  --web-bg: #eaf0f0;
  --pure-white: #fff;
  --main-black: #2a2a2a;
  --content-black: #747376;

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

  nav,
  footer,
  header,
  aside {
    display: block;
  }

  html,
  body {
    width: 100%;
    height: 100%;

    font-size: 100%;
    font-size: 14px;
    line-height: 1;
    text-size-adjust: 100%;
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
  gap: 8px;
  height: calc(100vh - 176px);

  .warningInfo {
    display: block;
    padding: 4px;
    color: white;
    text-align: center;
    background-color: var(--primary);
    border-radius: 10px;
  }

  .wrapper {
    overflow: hidden;
    display: flex;
    flex-direction: column;

    width: 100%;
    height: 100%;
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
    direction: rtl;
    overflow-y: auto;
    height: calc(100vh - 187px);
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
      height: calc(100vh - 215px);
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
  }

  .mainBlock {
    display: grid;
    grid-template-columns: 333px 90px;
    align-items: center;
    margin-top: 10px;

    width: 100%;

    &:first-child {
      margin-top: 0;
    }
  }

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
    padding-right: 14px;

    font-size: 14px;
    font-weight: 400;
    font-style: normal;
    line-height: 100%;
    color: var(--main-black) !important;
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
    height: calc(100% - 120px);
    padding: 0 10px;

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

export const ConnectedAccount: FC<{ loggedInAccountId: string; nearNetwork: NearNetworks }> = ({
  loggedInAccountId,
  nearNetwork,
}) => {
  const [contractNetwork, setContractNetwork] = useState<NearNetworks>()
  const [pairsToDisplay, setPairs] = useState<IConnectedAccountsPair[] | null>(null)
  // const [walletsForConnect, setWalletsForConnect] = useState<
  //   [IConnectedAccountUser, IConnectedAccountUser][]
  // >([])
  const [walletsForDisconnect, setWalletsForDisconnect] = useState<
    [IConnectedAccountUser, IConnectedAccountUser][]
  >([])
  const [isLoadingListDapplets, setLoadingListDapplets] = useState(true)
  // const [showConnectWalletsInfo, setShowConnectWalletsInfo] = useState(false)
  const [walletsReceivers, setWalletsReceivers] = useState<
    WalletDescriptorWithCAMainStatus[] | undefined
  >()
  const [connectedAccountsListReceiver, setConnectedAccountsListReceiver] =
    useState<WalletDescriptorWithCAMainStatus | null>(null)

  const { pairs, connectedAccountsNet } = useConnectedAccounts()
  // console.log('loggedInAccountId', loggedInAccountId)
  // console.log('nearNetwork', nearNetwork)
  // console.log('connectedAccountsNet', connectedAccountsNet)
  // console.log('pairs', pairs)
  const { changeCAStatus } = useChangeCAStatus()

  // useEffect(() => {
  //   const fn = async () => {
  //     const net = await getNet(`${loggedInAccountId}/near/${nearNetwork}`)
  //     console.log('net', net)
  //   }
  //   fn()
  // })

  // ToDo: remove abort controller
  const abortController = useAbortController()

  const updatePairs = async (prevPairs?: IConnectedAccountsPair[]) => {
    // const { getConnectedAccountsPairs, execConnectedAccountsUpdateHandler } =
    //   await initBGFunctions(browser)
    // const newPairs: IConnectedAccountsPair[] = connectedAccountsListReceiver
    //   ? await getConnectedAccountsPairs({
    //       receiver: connectedAccountsListReceiver,
    //       prevPairs,
    //     })
    //   : []
    const newPairs: IConnectedAccountsPair[] | null = pairs
    if (!abortController.signal.aborted) {
      setPairs(newPairs)
    }

    if (!newPairs || newPairs.length === 0) return
    const processingAccountIdsPairs = newPairs.filter(
      (p) => p.statusName === ConnectedAccountsPairStatus.Processing
    )
    if (processingAccountIdsPairs.length > 0) {
      await new Promise((res) => setTimeout(res, 5000))
      // await execConnectedAccountsUpdateHandler() // ToDo: ???????
      updatePairs(newPairs)
    }
  }

  const updateContractNetworkAndWallets = async () => {
    console.log('should updateContractNetworkAndWallets') // ToDo: remove mock data
    // const {
    //   getPreferredConnectedAccountsNetwork,
    //   getWalletDescriptors,
    //   getConnectedAccountStatus,
    // } = await initBGFunctions(browser)
    // const preferredConnectedAccountsNetwork: NearNetworks =
    //   await getPreferredConnectedAccountsNetwork()
    setContractNetwork(nearNetwork === 'testnet' ? NearNetworks.Testnet : NearNetworks.Mainnet)
    // setContractNetwork(preferredConnectedAccountsNetwork)
    // const descriptors: WalletDescriptor[] = await getWalletDescriptors()
    // const connectedWalletsDescriptors = descriptors
    //   .filter((d) => d.connected === true)
    //   .filter(
    //     (d: WalletDescriptor) =>
    //       d.type !== WalletTypes.DAPPLETS &&
    //       (d.chain === ChainTypes.ETHEREUM_SEPOLIA ||
    //         d.chain === ChainTypes.ETHEREUM_XDAI ||
    //         (preferredConnectedAccountsNetwork === NearNetworks.Testnet
    //           ? d.chain === ChainTypes.NEAR_TESTNET
    //           : d.chain === ChainTypes.NEAR_MAINNET))
    //   )
    // const walletsForGettingCALists: WalletDescriptorWithCAMainStatus[] = await Promise.all(
    //   connectedWalletsDescriptors.map(async (wallet) => {
    //     const receiverOrigin =
    //       wallet.chain === ChainTypes.ETHEREUM_SEPOLIA || wallet.chain === ChainTypes.ETHEREUM_XDAI
    //         ? 'ethereum'
    //         : wallet.chain
    //     const receiverStatus: boolean = await getConnectedAccountStatus(
    //       wallet.account,
    //       receiverOrigin
    //     )
    //     return { ...wallet, accountActive: receiverStatus }
    //   })
    // )
    // setWalletsReceivers(walletsForGettingCALists)
    // setConnectedAccountsListReceiver(walletsForGettingCALists[0])
  }

  useEffect(() => {
    updateContractNetworkAndWallets()
    // EventBus.on('connected_accounts_changed', () => updateContractNetworkAndWallets())// ToDo: ???????
  }, [abortController.signal.aborted])

  useEffect(() => {
    if (contractNetwork) {
      setLoadingListDapplets(true)
      updatePairs().then(() => {
        if (!abortController.signal.aborted) {
          setLoadingListDapplets(false)
        }
      })
    }

    // EventBus.on('wallet_changed', updateContractNetworkAndWallets)
    // return () => {
    //   EventBus.off('wallet_changed', updateContractNetworkAndWallets)
    // }
  }, [
    contractNetwork,
    loggedInAccountId,
    pairs,
    connectedAccountsNet,
    abortController.signal.aborted,
    connectedAccountsListReceiver,
  ])

  const findWalletsToConnect = async () => {
    console.log('should findWalletsToConnect') // ToDo: remove mock data
    // const { getWalletDescriptors, getConnectedAccountStatus, getConnectedAccounts } =
    //   await initBGFunctions(browser)
    // const descriptors: WalletDescriptor[] = await getWalletDescriptors()
    // const connectedWalletsDescriptors = descriptors.filter((d) => d.connected === true)
    // if (connectedWalletsDescriptors.length < 2) {
    //   // setWalletsForConnect([])
    //   setWalletsForDisconnect([])
    //   return
    // }

    // const connectedEthWallets = connectedWalletsDescriptors.filter(
    //   (d: WalletDescriptor) =>
    //     d.type !== WalletTypes.DAPPLETS &&
    //     (d.chain === ChainTypes.ETHEREUM_SEPOLIA || d.chain === ChainTypes.ETHEREUM_XDAI)
    // )
    // const connectedNearWallet = connectedWalletsDescriptors.find((d: WalletDescriptor) =>
    //   contractNetwork === NearNetworks.Testnet
    //     ? d.chain === ChainTypes.NEAR_TESTNET
    //     : d.chain === ChainTypes.NEAR_MAINNET
    // )
    // if (!connectedNearWallet) {
    //   // ToDo: we can't connect Eth wallets directly to each other. ONE Near wallet
    //   // setWalletsForConnect([])
    //   setWalletsForDisconnect([])
    //   return
    // }

    // const connectedAccountsUserEth: IConnectedAccountUser[] = []

    // for (const connectedEthWallet of connectedEthWallets) {
    //   const ethereumAccountStatus = await getConnectedAccountStatus(
    //     connectedEthWallet.account,
    //     'ethereum'
    //   )
    //   const connectedAccountUserEth: IConnectedAccountUser = {
    //     img: resources.ethereum.icon,
    //     name: connectedEthWallet.account,
    //     origin: connectedEthWallet.chain,
    //     accountActive: ethereumAccountStatus,
    //     walletType: connectedEthWallet.type,
    //   }
    //   connectedAccountsUserEth.push(connectedAccountUserEth)
    // }

    // const nearAccountStatus = await getConnectedAccountStatus(
    //   connectedNearWallet.account,
    //   contractNetwork === NearNetworks.Testnet ? ChainTypes.NEAR_TESTNET : ChainTypes.NEAR_MAINNET
    // )
    // const connectedAccountUserNear: IConnectedAccountUser = {
    //   img: resources[contractNetwork === NearNetworks.Testnet ? 'near/testnet' : 'near/mainnet']
    //     .icon,
    //   name: connectedNearWallet.account,
    //   origin:
    //     contractNetwork === NearNetworks.Testnet
    //       ? ChainTypes.NEAR_TESTNET
    //       : ChainTypes.NEAR_MAINNET,
    //   accountActive: nearAccountStatus,
    //   }

    //   const pairsToConnect: [IConnectedAccountUser, IConnectedAccountUser][] = []
    //   const pairsToDisconnect: [IConnectedAccountUser, IConnectedAccountUser][] = []
    //   const nearAccountGlobalId =
    //     connectedAccountUserNear.name + '/' + connectedAccountUserNear.origin
    //   loop1: for (const connectedAccountUserEth of connectedAccountsUserEth) {
    //     const directlyConnectedAccountsToEth: TConnectedAccount[][] = await getConnectedAccounts(
    //       connectedAccountUserEth.name,
    //       'ethereum',
    //       1
    //     )
    //     for (const ca of directlyConnectedAccountsToEth[0]) {
    //       if (ca.id === nearAccountGlobalId) {
    //         pairsToDisconnect.push([connectedAccountUserEth, connectedAccountUserNear])
    //         continue loop1
    //       }
    //     }
    //     pairsToConnect.push([connectedAccountUserEth, connectedAccountUserNear])
    //   }
    //   // setWalletsForConnect(pairsToConnect)
    //   setWalletsForDisconnect(pairsToDisconnect)
  }

  useEffect(() => {
    if (contractNetwork) findWalletsToConnect()
  }, [pairsToDisplay, contractNetwork])

  const handleOpenPopup = async (account: IConnectedAccountUser) => {
    console.log('should handleOpenPopup')
    changeCAStatus(account.name, account.origin) // ToDo: should open some popup
    // const { openConnectedAccountsPopup, getThisTab } = await initBGFunctions(browser)
    // const thisTab = await getThisTab()
    // try {
    //   await openConnectedAccountsPopup({ accountToChangeStatus: account }, thisTab.id)
    //   updatePairs()
    // } catch (err) {
    //   console.log(err)
    // }
  }

  const handleDisconnectAccounts = async (pair: IConnectedAccountsPair) => {
    console.log('should handleDisconnectAccounts') // ToDo: remove mock data
    // const disconnectedWallets = walletsForDisconnect.find((w) =>
    //   areSameAccounts([pair.firstAccount, pair.secondAccount], w)
    // )
    // const { openConnectedAccountsPopup, getThisTab } = await initBGFunctions(browser)
    // const thisTab = await getThisTab()
    // try {
    //   await openConnectedAccountsPopup(
    //     {
    //       accountsToDisconnect: disconnectedWallets
    //         ? disconnectedWallets
    //         : [pair.firstAccount, pair.secondAccount],
    //     },
    //     thisTab.id
    //   )
    //   updatePairs()
    // } catch (err) {
    //   console.log(err)
    // }
  }

  // const handleConnectWallets = async () => {
  //   if (!walletsForConnect.length) return
  //   const {
  //     openConnectedAccountsPopup,
  //     getThisTab,
  //   }: {
  //     openConnectedAccountsPopup: (
  //       {
  //         bunchOfAccountsToConnect,
  //       }: { bunchOfAccountsToConnect: [IConnectedAccountUser, IConnectedAccountUser][] },
  //       id: number
  //     ) => Promise<void>
  //     getThisTab: () => Promise<{ id: number }>
  //   } = await initBGFunctions(browser)
  //   const thisTab = await getThisTab()
  //   try {
  //     await openConnectedAccountsPopup(
  //       {
  //         bunchOfAccountsToConnect: walletsForConnect,
  //       },
  //       thisTab.id
  //     )
  //     updatePairs()
  //   } catch (err) {
  //     console.log(err)
  //   }
  // }

  return (
    <ConnectedAccountsContainer>
      {contractNetwork === NearNetworks.Testnet && (
        <div className="warningInfo">Connected Accounts are using a test network</div>
      )}
      {/* <div className="caHeaderTop">
        <h3>Accounts connected to:</h3>
      </div> */}
      {/* <div className="header">
        {walletsReceivers ? (
          <div>
            <DropdownCAListReceiver
              values={walletsReceivers}
              setter={setConnectedAccountsListReceiver}
              selected={connectedAccountsListReceiver ?? undefined}
              maxLength={42}
            />
          </div>
        ) : null} */}
      {/* <div className={styles.connectWalletsBtnModule}>
            <button
              disabled={!walletsForConnect.length}
              className={styles.connectWalletsBtn}
              onClick={() => handleConnectWallets()}
            >
              Connect wallets
            </button>
            <button
              className={cn(styles.connectWalletsBtnInfo, showConnectWalletsInfo && styles.active)}
              onClick={() => setShowConnectWalletsInfo(!showConnectWalletsInfo)}
            >
              <Info />
            </button>
          </div> */}
      {/* </div> */}
      {/* <div className={styles.connectWalletsInfoWrapper}>
          <div
            className={cn(
              styles.connectWalletsInfo,
              showConnectWalletsInfo && styles.connectWalletsInfoVisible
            )}
          >
            <p>You can connect your Ethereum account to your NEAR account.</p>
            <p>
              Add the wallets you want to connect to the WALLETS list above and click the button.
            </p>
          </div>
        </div> */}
      {isLoadingListDapplets ? (
        <TabLoader />
      ) : (
        <div className="wrapper">
          {!pairsToDisplay || pairsToDisplay.length === 0 ? (
            <Message
              className="noAccounts"
              title={'There are no connected accounts'}
              subtitle={
                <p>
                  {!loggedInAccountId
                    ? 'Connect your wallet to see connected accounts'
                    : 'Connection of new accounts will be available soon'}
                </p>
              }
            />
          ) : (
            <div className="accountsWrapper">
              <div
                className={cn('scrollContent', {
                  withWarning: contractNetwork === NearNetworks.Testnet,
                })}
              >
                {pairsToDisplay.map((x, i) => {
                  const statusLabel =
                    x.statusName === ConnectedAccountsPairStatus.Connected
                      ? Ok
                      : x.statusName === ConnectedAccountsPairStatus.Processing
                        ? Time
                        : Attention
                  const areWallets = areConnectedAccountsUsersWallets(
                    x.firstAccount,
                    x.secondAccount
                  )
                  const canDisconnectWallets =
                    walletsForDisconnect.length &&
                    walletsForDisconnect.some((w) =>
                      areSameAccounts(w, [x.firstAccount, x.secondAccount])
                    )

                  return (
                    <div key={x.secondAccount.name + x.secondAccount.origin} className="mainBlock">
                      <div className={cn('accountBlock', 'accountBlockVertical')}>
                        <CAUserButton user={x.firstAccount} onClick={handleOpenPopup} />
                        <CAUserButton user={x.secondAccount} onClick={handleOpenPopup} />
                      </div>
                      <div className="accountStatus">
                        <div data-title={x.statusMessage}>
                          <img
                            src={String(statusLabel)}
                            className={cn('statusLabel', {
                              statusConnected:
                                x.statusName === ConnectedAccountsPairStatus.Connected,
                              statusProcessing:
                                x.statusName === ConnectedAccountsPairStatus.Processing,
                              statusError: x.statusName === ConnectedAccountsPairStatus.Error,
                            })}
                            alt={x.statusMessage}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDisconnectAccounts(x)}
                          className="buttonDelete"
                          disabled={
                            x.closeness > 1 ||
                            (!areWallets &&
                              x.statusName !== ConnectedAccountsPairStatus.Connected) ||
                            (areWallets && !canDisconnectWallets)
                          }
                        >
                          <Trash />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </ConnectedAccountsContainer>
  )
}

const deleteNetworkOfEthereumOrigin = (origin: string): string =>
  origin.indexOf('ethereum') === -1 ? origin : 'ethereum'

const makeSimplePair = (
  pair: [IConnectedAccountUser, IConnectedAccountUser]
): { name: string; origin: string }[] =>
  pair.map((ac) => {
    const origin = deleteNetworkOfEthereumOrigin(ac.origin)
    return { name: ac.name, origin }
  })

const areSameAccounts = (
  pair1: [IConnectedAccountUser, IConnectedAccountUser],
  pair2: [IConnectedAccountUser, IConnectedAccountUser]
) => {
  const simplePair1 = makeSimplePair(pair1)
  const simplePair2 = makeSimplePair(pair2)
  return (
    (simplePair1[0].name === simplePair2[0].name &&
      simplePair1[0].origin === simplePair2[0].origin &&
      simplePair1[1].name === simplePair2[1].name &&
      simplePair1[1].origin === simplePair2[1].origin) ||
    (simplePair1[0].name === simplePair2[1].name &&
      simplePair1[0].origin === simplePair2[1].origin &&
      simplePair1[1].name === simplePair2[0].name &&
      simplePair1[1].origin === simplePair2[0].origin)
  )
}

const areConnectedAccountsUsersWallets = (...users: IConnectedAccountUser[]) =>
  users.every((user) => resources[user.origin].type === 'wallet')
