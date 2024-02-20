"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DappletsEngineNs = exports.getNearConfig = exports.NearConfigs = void 0;
exports.NearConfigs = {
    mainnet: {
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        contractName: 'social.dapplets.near',
        walletUrl: 'https://wallet.near.org',
    },
};
const getNearConfig = (networkId) => {
    const config = exports.NearConfigs[networkId];
    if (!config)
        throw new Error(`Unknown networkId ${networkId}`);
    return config;
};
exports.getNearConfig = getNearConfig;
exports.DappletsEngineNs = 'engine';
