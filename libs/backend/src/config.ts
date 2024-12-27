export type BuiltInLayoutManagers = {
  vertical: string
  horizontal: string
  ear: string
}

export type TimeReference = {
  timestamp: number
  height: number
  avgBlockTime: number
}

export type NearConfig = {
  networkId: string
  nodeUrl: string
  contractName: string
  walletUrl: string
  defaultMutationId: string
  layoutManagers: BuiltInLayoutManagers
  timeReference: TimeReference
  connectedAccountsContractAddress: string
}

export const NearConfigs: { [networkId: string]: NearConfig } = {
  mainnet: {
    networkId: 'mainnet',
    nodeUrl: 'https://mainnet.near.dapplets.org',
    contractName: 'social.dapplets.near',
    walletUrl: 'https://app.mynearwallet.com',
    defaultMutationId: 'bos.dapplets.near/mutation/Sandbox',
    layoutManagers: {
      vertical: 'bos.dapplets.near/widget/VerticalLayoutManager',
      horizontal: 'bos.dapplets.near/widget/DefaultLayoutManager',
      ear: 'bos.dapplets.near/widget/ContextActionsGroup',
    },
    timeReference: {
      timestamp: 1733844432230,
      height: 134671239,
      avgBlockTime: 1091, // https://nearblocks.io/
    },
    connectedAccountsContractAddress: 'connected-accounts.near',
  },
  testnet: {
    networkId: 'testnet',
    nodeUrl: 'https://testnet.near.dapplets.org',
    contractName: 'social.dapplets.testnet',
    walletUrl: 'https://testnet.mynearwallet.com',
    defaultMutationId: 'bos.dapplets.testnet/mutation/Sandbox',
    layoutManagers: {
      vertical: 'bos.dapplets.testnet/widget/VerticalLayoutManager',
      horizontal: 'bos.dapplets.testnet/widget/DefaultLayoutManager',
      ear: 'bos.dapplets.testnet/widget/ContextActionsGroup',
    },
    timeReference: {
      timestamp: 1733844492601,
      height: 181770025,
      avgBlockTime: 1000, // https://testnet.nearblocks.io/
    },
    connectedAccountsContractAddress: 'dev-1674551865700-67703371677231',
  },
}

export const getNearConfig = (networkId: string): NearConfig => {
  const config = NearConfigs[networkId]
  if (!config) throw new Error(`Unknown networkId ${networkId}`)
  return config
}
