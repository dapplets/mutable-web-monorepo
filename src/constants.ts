export type NearConfig = {
  networkId: string;
  nodeUrl: string;
  contractName: string;
  walletUrl: string;
};

export const NearConfigs: { [networkId: string]: NearConfig } = {
  mainnet: {
    networkId: "mainnet",
    nodeUrl: "https://rpc.mainnet.near.org",
    contractName: "social.dapplets.near",
    walletUrl: "https://wallet.near.org",
  },
};

export const getNearConfig = (networkId: string): NearConfig => {
  const config = NearConfigs[networkId];
  if (!config) throw new Error(`Unknown networkId ${networkId}`);
  return config;
};

export const DappletsEngineNs = "https://dapplets.org/ns/engine";