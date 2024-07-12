export type BuiltInLayoutManagers = {
  vertical: string
  horizontal: string
  ear: string
}

export type NearConfig = {
  networkId: string
  nodeUrl: string
  contractName: string
  walletUrl: string
  defaultMutationId: string
  layoutManagers: BuiltInLayoutManagers
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
  },
}

export const getNearConfig = (networkId: string): NearConfig => {
  const config = NearConfigs[networkId]
  if (!config) throw new Error(`Unknown networkId ${networkId}`)
  return config
}

export const ViewportElementId = 'mweb-engine-viewport'

export const ViewportInnerElementId = 'mweb-engine-viewport-inner'
