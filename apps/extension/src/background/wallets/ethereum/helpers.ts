import { ChainTypes } from '@mweb/backend'

export const getChainParameters = (chain: ChainTypes) => {
  switch (chain) {
    case ChainTypes.ETHEREUM_SEPOLIA:
      return {
        name: 'sepolia',
        chainId: 11155111,
        providerUrl: 'https://sepolia.infura.io/v3//f1e18c6f81a24a708414085ef2520f2c',
        ensAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
      }

    case ChainTypes.ETHEREUM_XDAI:
      return {
        chainId: 100,
        providerUrl: 'https://rpc.gnosischain.com/',
      }

    default:
      return {}
  }
}
