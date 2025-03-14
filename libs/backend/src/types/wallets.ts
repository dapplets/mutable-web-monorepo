export enum ChainTypes {
  ETHEREUM_SEPOLIA = 'ethereum/sepolia',
  ETHEREUM_XDAI = 'ethereum/xdai',
  NEAR_TESTNET = 'near/testnet',
  NEAR_MAINNET = 'near/mainnet',
}

export enum WalletTypes {
  METAMASK = 'metamask',
  MYNEARWALLET = 'mynearwallet',
  DAPPLETS_ETHEREUM = 'dapplets-ethereum',
}

export enum NearNetworks {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
}

export interface WalletDescriptor {
  chain: ChainTypes
  type: WalletTypes
  meta: {
    icon: string
    name: string
    description: string
  } | null
  connected: boolean
  available: boolean
  account: string
  chainId: number
  apps: string[]
  default: boolean
  lastUsage: string
}

export interface WalletDescriptorWithCAMainStatus extends WalletDescriptor {
  accountActive: boolean
}
