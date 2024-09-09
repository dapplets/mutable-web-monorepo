export const networkConfigs = {
  mainnet: {
    networkId: 'mainnet',
    nodeUrl: 'https://mainnet.near.dapplets.org',
    walletUrl: 'https://app.mynearwallet.com',
    helperUrl: 'https://helper.mainnet.near.org',
    explorerUrl: 'https://nearblocks.io',
    socialDbContract: 'social.near',
  },
  testnet: {
    networkId: 'testnet',
    nodeUrl: 'https://testnet.near.dapplets.org',
    walletUrl: 'https://testnet.mynearwallet.com',
    helperUrl: 'https://helper.testnet.near.org',
    explorerUrl: 'https://testnet.nearblocks.io',
    socialDbContract: 'v1.social08.testnet',
  },
}

export type NearNetworkId = 'testnet' | 'mainnet'

export const DefaultNetworkId: NearNetworkId = 'mainnet'
