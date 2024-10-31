export const networkConfigs = {
  mainnet: {
    networkId: 'mainnet',
    nodeUrl: 'https://mainnet.near.dapplets.org',
    walletUrl: 'https://app.mynearwallet.com',
    helperUrl: 'https://helper.mainnet.near.org',
    explorerUrl: 'https://nearblocks.io',
    socialDbContract: 'social.near',
    avatarUrl: 'https://i.near.social/magic/thumbnail/https://near.social/magic/img/account',
  },
  testnet: {
    networkId: 'testnet',
    nodeUrl: 'https://testnet.near.dapplets.org',
    walletUrl: 'https://testnet.mynearwallet.com',
    helperUrl: 'https://helper.testnet.near.org',
    explorerUrl: 'https://testnet.nearblocks.io',
    socialDbContract: 'v1.social08.testnet',
    avatarUrl: 'https://i.near.social/magic/thumbnail/https://test.near.social/magic/img/account',
  },
}

export const crawlerConfig = {
  chatGptApiKey: '', // ToDo: specify something
  organizationId: 'org-E5yF3X7tcVHJQ0geNL5v0FDY',
  projectId: 'proj_kptuPrR2y29wj9gnsbtMH2cT',
  assistantId: 'asst_Pbw8hjZvGRhxbJtH9FrjU0xm',
  storageServerUrl: DEFAULT_CRAWLER_API_URL ?? 'http://localhost:3001',
}

export type NearNetworkId = 'testnet' | 'mainnet'

export const DefaultNetworkId: NearNetworkId = 'mainnet'
