import { Runtime } from 'webextension-polyfill'

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

export type MessageWrapperRequest = {
  request: {
    handler: string
    type: string
    payload: {
      path: string
      args: JsonValue[]
    }
  }
  sender: Runtime.MessageSender
}

export interface ProviderRpcError extends Error {
  message: string
  code: number
  data?: unknown
}

export interface ProviderMessage {
  type: string
  data: unknown
}

export interface ProviderInfo {
  chainId: string
}

export type AccountAddress = string

export type ProviderAccounts = AccountAddress[]

export type ConnectListener = (info: ProviderInfo) => void

export type DisconnectListener = (error: ProviderRpcError) => void

export type MessageListener = (message: ProviderMessage) => void

export type ChainListener = (chainId: string) => void

export type AccountsListener = (accounts: ProviderAccounts) => void

export type ProviderEvent =
  | 'connect'
  | 'disconnect'
  | 'message'
  | 'chainChanged'
  | 'accountsChanged'

export interface SimpleEventEmitter {
  on(
    event: ProviderEvent,
    listener:
      | ConnectListener
      | DisconnectListener
      | MessageListener
      | ChainListener
      | AccountsListener
  ): void
  removeListener(
    event: ProviderEvent,
    listener:
      | ConnectListener
      | DisconnectListener
      | MessageListener
      | ChainListener
      | AccountsListener
  ): void
}

export interface SimplifiedEIP1193Provider extends SimpleEventEmitter {
  on(event: 'connect', listener: ConnectListener): void
  on(event: 'disconnect', listener: DisconnectListener): void
  on(event: 'message', listener: MessageListener): void
  on(event: 'chainChanged', listener: ChainListener): void
  on(event: 'accountsChanged', listener: AccountsListener): void
  // Simplification of the EIP1193Provider interface
  // request(args: EthAccountsRequest): Promise<ProviderAccounts>;
  // request(args: EthBalanceRequest): Promise<Balance>;
  // request(args: EIP1102Request): Promise<ProviderAccounts>;
  // request(args: SelectAccountsRequest): Promise<ProviderAccounts>;
  // request(args: EIP3326Request): Promise<null>;
  // request(args: EIP3085Request): Promise<null>;
  // request(args: EthChainIdRequest): Promise<ChainId>;
  // request(args: EthSignTransactionRequest): Promise<string>;
  // request(args: EthSignMessageRequest): Promise<string>;
  // request(args: PersonalSignMessageRequest): Promise<string>;
  // request(args: EIP712Request): Promise<string>;
  request(args: { method: string; params?: Array<unknown> }): Promise<unknown>
  disconnect?(): void
}
