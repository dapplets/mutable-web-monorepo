import { ChainTypes, WalletTypes } from '@mweb/backend'
import { WalletImpl } from './near'
import dapplets from './ethereum/dapplets'
import metamask from './ethereum/metamask'

export default {
  [ChainTypes.ETHEREUM_SEPOLIA]: {
    [WalletTypes.METAMASK]: metamask,
    [WalletTypes.DAPPLETS_ETHEREUM]: dapplets,
  },
  [ChainTypes.ETHEREUM_XDAI]: {
    [WalletTypes.METAMASK]: metamask,
    [WalletTypes.DAPPLETS_ETHEREUM]: dapplets,
  },
  [ChainTypes.NEAR_MAINNET]: { [WalletTypes.MYNEARWALLET]: WalletImpl },
  [ChainTypes.NEAR_TESTNET]: { [WalletTypes.MYNEARWALLET]: WalletImpl },
}
