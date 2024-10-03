export interface IWalletConnect {
  nearNetwork: 'mainnet' | 'testnet'
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
}
