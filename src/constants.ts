export type NearConfig = {
  networkId: string
  nodeUrl: string
  contractName: string
  walletUrl: string
  defaultMutationId: string
  defaultLayoutManager: string
}

export const NearConfigs: { [networkId: string]: NearConfig } = {
  mainnet: {
    networkId: 'mainnet',
    nodeUrl: 'https://rpc.mainnet.near.org',
    contractName: 'social.dapplets.near',
    walletUrl: 'https://app.mynearwallet.com',
    defaultMutationId: 'bos.dapplets.near/mutation/Sandbox',
    defaultLayoutManager: 'bos.dapplets.near/widget/DefaultLayoutManager',
  },
  testnet: {
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    contractName: 'social.dapplets.testnet',
    walletUrl: 'https://testnet.mynearwallet.com',
    defaultMutationId: 'bos.dapplets.testnet/mutation/Sandbox',
    defaultLayoutManager: 'bos.dapplets.testnet/widget/DefaultLayoutManager',
  },
}

export const getNearConfig = (networkId: string): NearConfig => {
  const config = NearConfigs[networkId]
  if (!config) throw new Error(`Unknown networkId ${networkId}`)
  return config
}

export const DappletsEngineNs = 'engine'

export const bosLoaderUrl = 'http://127.0.0.1:3030/'

export const ViewportElementId = 'mweb-engine-viewport'

export const ViewportInnerElementId = 'mweb-engine-viewport-inner'
