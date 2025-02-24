import { ethers, Signer } from 'ethers'
import { GenericWallet } from '../interface'

export interface EthereumWallet extends GenericWallet, Signer {
  sendTransactionOutHash(transaction: ethers.providers.TransactionRequest): Promise<string>
  sendCustomRequest(method: string, params: any[]): Promise<any>
  signMessage(message: string): Promise<string>
}
