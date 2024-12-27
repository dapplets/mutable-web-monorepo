import makeBlockie from 'ethereum-blockies-base64'
import * as nearAPI from 'near-api-js'
// import * as EventBus from '../../common/global-event-bus'
import {
  ChainTypes,
  ConnectedAccountsPairStatus,
  ConnectedAccountsRequestStatus,
  IConnectedAccountsPair,
  IConnectedAccountUser,
  NearNetworks,
  TConnectedAccount,
  TConnectedAccountsVerificationRequestInfo,
} from './types'
// import GlobalConfigService from './globalConfigService'
// import { WalletService } from './walletService'
import { NearSigner } from '../near-signer/near-signer.service'

type EthSignature = {
  sig: string
  v: number
  mc: boolean
}

export class ConnectedAccountsService {
  constructor(
    // private _globalConfigService: GlobalConfigService,
    // private _walletService: WalletService
    private nearSigner: NearSigner,
    private contractName: string
  ) {}

  // private _createContract = (near_account: nearAPI.Account, contractAddress: string) =>
  //   new nearAPI.Contract(near_account, contractAddress, {
  //     viewMethods: [
  //       'getConnectedAccounts',
  //       'getMinStakeAmount',
  //       'getPendingRequests',
  //       'getVerificationRequest',
  //       'getStatus',
  //       'getMainAccount',
  //       'getRequestStatus',
  //       'areConnected',
  //       'getNet',
  //     ],
  //     changeMethods: ['requestVerification', 'changeStatus'],
  //   })

  // private async _getContract(network?: NearNetworks) {
  //   const contractNetwork =
  //     network === NearNetworks.Mainnet || network === NearNetworks.Testnet
  //       ? network
  //       : this.networkId as NearNetworks
  //   switch (contractNetwork) {
  //     case 'mainnet':
  //       if (!this._mainnetContract) {
  //         const contractAddress = getNearConfig(NearNetworks.Mainnet).connectedAccountsContractAddress
  //         const near_account = await this.nearSigner.getAccount()
  //         this._mainnetContract = near_account && this._createContract(near_account, contractAddress)
  //       }
  //       return this._mainnetContract
  //     case 'testnet':
  //       if (!this._testnetContract) {
  //         const contractAddress = getNearConfig(NearNetworks.Testnet).connectedAccountsContractAddress
  //         const near_account = await this.nearSigner.getAccount()
  //         this._testnetContract = near_account && this._createContract(near_account, contractAddress)
  //       }
  //       return this._testnetContract
  //   }
  // }

  // ***** VIEW *****

  public async getConnectedAccounts(
    accountId: string,
    originId: string,
    closeness?: number
    // network?: NearNetworks // ToDo: is it necessary? -- in all methods
  ): Promise<TConnectedAccount[][] | null> {
    return this.nearSigner.view(this.contractName, 'getConnectedAccounts', {
      accountId,
      originId,
      closeness,
    })
  }

  public async getMinStakeAmount(network?: NearNetworks): Promise<number> {
    return this.nearSigner.view(this.contractName, 'getMinStakeAmount', {})
  }

  public async getPendingRequests(network?: NearNetworks): Promise<number[]> {
    return this.nearSigner.view(this.contractName, 'getPendingRequests', {})
  }

  public async getVerificationRequest(
    id: number,
    network?: NearNetworks
  ): Promise<TConnectedAccountsVerificationRequestInfo | null> {
    return this.nearSigner.view(this.contractName, 'getVerificationRequest', { id })
  }

  public async getStatus(
    accountId: string,
    originId: string,
    network?: NearNetworks
  ): Promise<boolean> {
    return this.nearSigner.view(this.contractName, 'getStatus', { accountId, originId })
  }

  public async areConnected(
    accountGId1: string,
    accountGId2: string,
    network?: NearNetworks
  ): Promise<boolean> {
    return this.nearSigner.view(this.contractName, 'areConnected', { accountGId1, accountGId2 })
  }

  public async getNet(accountGId: string, network?: NearNetworks): Promise<string[] | null> {
    return this.nearSigner.view(this.contractName, 'getNet', { accountGId })
  }

  public async getMainAccount(
    accountId: string,
    originId: string,
    network?: NearNetworks
  ): Promise<string | null> {
    return this.nearSigner.view(this.contractName, 'getMainAccount', { accountId, originId })
  }

  public async getRequestStatus(
    id: number,
    network?: NearNetworks
  ): Promise<ConnectedAccountsRequestStatus> {
    const status = await this.nearSigner.view(this.contractName, 'getRequestStatus', { id })
    switch (status) {
      case 0:
        return ConnectedAccountsRequestStatus.NotFound
      case 1:
        return ConnectedAccountsRequestStatus.Pending
      case 2:
        return ConnectedAccountsRequestStatus.Approved
      case 3:
        return ConnectedAccountsRequestStatus.Rejected
      default:
        throw new Error('Error in Connected Accounts getRequestStatus()')
    }
  }

  public async getPairs({
    receiver,
    prevPairs,
  }: {
    receiver: {
      account: string
      chain: ChainTypes
      accountActive: boolean
    }
    prevPairs: IConnectedAccountsPair[] | null
  }): Promise<IConnectedAccountsPair[]> {
    let newPairs: IConnectedAccountsPair[] = []
    const processingAccountIdsPairs: [string, string][] = []
    const newPendingIds: number[] = []

    const receiverOrigin =
      receiver.chain === ChainTypes.ETHEREUM_SEPOLIA || receiver.chain === ChainTypes.ETHEREUM_XDAI
        ? 'ethereum'
        : receiver.chain
    const receiverConnectedAccountUser: IConnectedAccountUser = {
      name: receiver.account,
      origin: receiverOrigin,
      img: receiver.account && makeBlockie(receiver.account),
      accountActive: receiver.accountActive,
    }
    const globalId = receiver.account + '/' + receiverOrigin

    // *** PENDING ***
    const addPendingPair = async (accountGlobalId: string, pendingRequestId: number) => {
      const [name, origin1, origin2] = accountGlobalId.split('/')
      const origin = origin2 ? origin1 + '/' + origin2 : origin1
      const accStatus: boolean = await this.getStatus(name, origin)
      newPairs.push({
        firstAccount: receiverConnectedAccountUser,
        secondAccount: {
          name,
          origin,
          img: name && makeBlockie(name),
          accountActive: accStatus,
        },
        statusName: ConnectedAccountsPairStatus.Processing,
        statusMessage: 'Processing',
        closeness: 1,
        pendingRequestId,
      })
      processingAccountIdsPairs.push([globalId, accountGlobalId])
      newPendingIds.push(pendingRequestId)
    }

    const pendingRequestsIds: number[] = await this.getPendingRequests()
    if (pendingRequestsIds && pendingRequestsIds.length > 0) {
      for (const pendingRequestId of pendingRequestsIds) {
        const verificationRequest = await this.getVerificationRequest(pendingRequestId)
        if (!verificationRequest) continue
        const { firstAccount, secondAccount } = verificationRequest
        if (firstAccount === globalId) {
          await addPendingPair(secondAccount, pendingRequestId)
        } else if (secondAccount === globalId) {
          await addPendingPair(firstAccount, pendingRequestId)
        }
      }
    }

    // *** CONNECTED ***
    const connectedAccounts = await this.getConnectedAccounts(receiver.account, receiverOrigin)
    connectedAccounts?.forEach((level, i) =>
      level.forEach((ca) => {
        if (this._hasEqualIdsPair([globalId, ca.id], processingAccountIdsPairs)) return
        const [caName, caOrigin1, caOrigin2] = ca.id.split('/')
        newPairs.push({
          firstAccount: receiverConnectedAccountUser,
          secondAccount: {
            name: caName,
            origin: caOrigin2 ? caOrigin1 + '/' + caOrigin2 : caOrigin1,
            img: caName && makeBlockie(caName),
            accountActive: ca.status.isMain,
          },
          statusName: ConnectedAccountsPairStatus.Connected,
          statusMessage: 'Connected',
          closeness: i + 1,
        })
      })
    )

    // *** REJECTED ***
    if (prevPairs) {
      const prevPendingPairs = prevPairs.filter(
        (pair) => pair.statusName && pair.statusName === ConnectedAccountsPairStatus.Processing
      )
      const resolvedPairs = prevPendingPairs.filter(
        (prevPair) => !newPendingIds.includes(prevPair.pendingRequestId!)
      )
      if (resolvedPairs.length !== 0) {
        for (const resolvedPair of resolvedPairs) {
          const requestStatus: ConnectedAccountsRequestStatus = await this.getRequestStatus(
            resolvedPair.pendingRequestId!
          )
          if (requestStatus !== ConnectedAccountsRequestStatus.Rejected) continue

          const newPairsLengthBeforeFilter = newPairs.length
          newPairs = newPairs.filter(
            (p) =>
              !(
                p.firstAccount.name === resolvedPair.firstAccount.name &&
                p.firstAccount.origin === resolvedPair.firstAccount.origin &&
                p.secondAccount.name === resolvedPair.secondAccount.name &&
                p.secondAccount.origin === resolvedPair.secondAccount.origin
              ) &&
              !(
                p.secondAccount.name === resolvedPair.firstAccount.name &&
                p.secondAccount.origin === resolvedPair.firstAccount.origin &&
                p.firstAccount.name === resolvedPair.secondAccount.name &&
                p.firstAccount.origin === resolvedPair.secondAccount.origin
              )
          )
          newPairs.unshift({
            firstAccount: resolvedPair.firstAccount,
            secondAccount: resolvedPair.secondAccount,
            statusName: ConnectedAccountsPairStatus.Error,
            statusMessage:
              newPairsLengthBeforeFilter === newPairs.length
                ? 'Connection rejected'
                : 'Disconnection rejected',
            closeness: 1,
          })
        }
      }
    }
    return newPairs
  }

  // ***** CALL *****

  public async requestVerification(
    props: {
      firstAccountId: string
      firstOriginId: string
      secondAccountId: string
      secondOriginId: string
      isUnlink: boolean
      firstProofUrl?: string
      secondProofUrl?: string
      signature?: EthSignature
      statement?: string
    },
    stake?: number,
    network?: NearNetworks
  ): Promise<number | null> {
    const {
      firstAccountId,
      firstOriginId,
      secondAccountId,
      secondOriginId,
      isUnlink,
      firstProofUrl,
      secondProofUrl,
      signature,
      statement,
    } = props
    const requestBody: {
      firstAccountId: string
      firstOriginId: string
      secondAccountId: string
      secondOriginId: string
      isUnlink: boolean
      firstProofUrl?: string
      secondProofUrl?: string
      signature: EthSignature | null
      statement?: string
    } = {
      firstAccountId,
      firstOriginId,
      secondAccountId,
      secondOriginId,
      isUnlink,
      signature: signature === undefined ? null : signature,
    }
    if (firstProofUrl) requestBody.firstProofUrl = firstProofUrl
    if (secondProofUrl) requestBody.secondProofUrl = secondProofUrl
    if (statement) requestBody.statement = statement

    const gas = (signature ? 300_000_000_000_000 : 30_000_000_000_000) + ''
    const amount = stake === null ? undefined : stake
    const result = await this.nearSigner.call(
      this.contractName,
      'requestVerification',
      requestBody,
      gas,
      amount + ''
    )
    if (!result) {
      console.log('Transaction failed or no result.')
      return null
    }
    const status = (result as nearAPI.providers.FinalExecutionOutcome)
      .status as nearAPI.providers.FinalExecutionStatus

    if (status.SuccessValue) {
      // EventBus.emit('connected_accounts_changed') // ToDo ????
      const decodedResult = Buffer.from(status.SuccessValue, 'base64').toString()
      return +decodedResult
    } else {
      console.log('Transaction failed or no result.')
      return null
    }
  }

  public async changeStatus(
    accountId: string,
    originId: string,
    isMain: boolean,
    network?: NearNetworks
  ): Promise<void> {
    await this.nearSigner.call(this.contractName, 'changeStatus', {
      accountId,
      originId,
      isMain,
    })
    // EventBus.emit('connected_accounts_changed') // ToDo ????
    return
  }

  private _hasEqualIdsPair(pair: [string, string], list: [string, string][]): boolean {
    for (const one of list) {
      if (
        (one[0] === pair[0] && one[1] === pair[1]) ||
        (one[0] === pair[1] && one[1] === pair[0])
      ) {
        return true
      }
    }
    return false
  }
}
