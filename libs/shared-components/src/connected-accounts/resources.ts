import { GithubIcon, XIcon } from './assets/resources/social'
import { EthIcon, NearIcon } from './assets/resources/wallets'

export interface Resources {
  [name: string]: {
    title: string
    type: 'social' | 'wallet'
    icon: () => JSX.Element
    proofUrl: (name: string) => string | null
  }
}

export const resources: Resources = {
  x: {
    title: 'X',
    type: 'social',
    icon: XIcon,
    proofUrl: (name) => 'https://x.com/' + name, // ToDo: should use it!!!
  },
  twitter: {
    title: 'X',
    type: 'social',
    icon: XIcon,
    proofUrl: (name) => 'https://x.com/' + name, // ToDo: should use it!!!
  },
  github: {
    title: 'GitHub',
    type: 'social',
    icon: GithubIcon,
    proofUrl: (name) => 'https://github.com/' + name, // ToDo: should use it!!!
  },
  'near/testnet': {
    title: 'NEAR Testnet',
    type: 'wallet',
    icon: NearIcon,
    proofUrl: () => null,
  },
  'near/mainnet': {
    title: 'NEAR Mainnet',
    type: 'wallet',
    icon: NearIcon,
    proofUrl: () => null,
  },
  ethereum: {
    title: 'Ethereum',
    type: 'wallet',
    icon: EthIcon,
    proofUrl: () => null,
  },
  'ethereum/sepolia': {
    title: 'Ethereum',
    type: 'wallet',
    icon: EthIcon,
    proofUrl: () => null,
  },
  'ethereum/xdai': {
    title: 'Ethereum',
    type: 'wallet',
    icon: EthIcon,
    proofUrl: () => null,
  },
}
