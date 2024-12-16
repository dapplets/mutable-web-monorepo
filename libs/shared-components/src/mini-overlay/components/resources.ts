import GITHUB_ICON from '../assets/resources/social/github.svg'
import X_ICON from '../assets/resources/social/x.svg'
import ETH_ICON from '../assets/resources/wallets/eth.svg'
import NEAR_ICON from '../assets/resources/wallets/near-black.svg'

export interface Resources {
  [name: string]: {
    title: string
    type: 'social' | 'wallet'
    icon: string
    proofUrl: (name: string) => string | null
  }
}

export const resources: Resources = {
  twitter: {
    title: 'X',
    type: 'social',
    icon: X_ICON,
    proofUrl: (name) => 'https://x.com/' + name,
  },
  github: {
    title: 'GitHub',
    type: 'social',
    icon: GITHUB_ICON,
    proofUrl: (name) => 'https://github.com/' + name,
  },
  'near/testnet': {
    title: 'NEAR Testnet',
    type: 'wallet',
    icon: NEAR_ICON,
    proofUrl: () => null,
  },
  'near/mainnet': {
    title: 'NEAR Mainnet',
    type: 'wallet',
    icon: NEAR_ICON,
    proofUrl: () => null,
  },
  ethereum: {
    title: 'Ethereum',
    type: 'wallet',
    icon: ETH_ICON,
    proofUrl: () => null,
  },
  'ethereum/sepolia': {
    title: 'Ethereum',
    type: 'wallet',
    icon: ETH_ICON,
    proofUrl: () => null,
  },
  'ethereum/xdai': {
    title: 'Ethereum',
    type: 'wallet',
    icon: ETH_ICON,
    proofUrl: () => null,
  },
}
