export interface IWalletConnect {
  nearNetwork: string
  onConnectWallet: () => Promise<void>
  onDisconnectWallet: () => Promise<void>
}
