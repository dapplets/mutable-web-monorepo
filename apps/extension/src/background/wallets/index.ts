import { WalletTypes } from '@mweb/backend'
import { WalletImpl } from './near'
import dapplets from './ethereum/dapplets'
import metamask from './ethereum/metamask'

export default {
  [WalletTypes.METAMASK]: metamask,
  [WalletTypes.DAPPLETS_ETHEREUM]: dapplets,
  [WalletTypes.MYNEARWALLET]: WalletImpl,
}
