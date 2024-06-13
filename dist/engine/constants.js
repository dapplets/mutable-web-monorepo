"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewportInnerElementId = exports.ViewportElementId = exports.bosLoaderUrl = exports.getNearConfig = exports.NearConfigs = void 0;
exports.NearConfigs = {
    mainnet: {
        networkId: 'mainnet',
        nodeUrl: 'https://go.getblock.io/75e825521eeb49c9bbb15e6c977b147c',
        contractName: 'social.dapplets.near',
        walletUrl: 'https://app.mynearwallet.com',
        defaultMutationId: 'bos.dapplets.near/mutation/Sandbox',
        defaultLayoutManager: 'bos.dapplets.near/widget/DefaultLayoutManager',
    },
    testnet: {
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        contractName: 'social.dapplets.testnet',
        walletUrl: 'https://testnet.mynearwallet.com',
        defaultMutationId: 'bos.dapplets.testnet/mutation/Sandbox',
        defaultLayoutManager: 'bos.dapplets.testnet/widget/DefaultLayoutManager',
    },
};
const getNearConfig = (networkId) => {
    const config = exports.NearConfigs[networkId];
    if (!config)
        throw new Error(`Unknown networkId ${networkId}`);
    return config;
};
exports.getNearConfig = getNearConfig;
exports.bosLoaderUrl = 'http://127.0.0.1:3030/';
exports.ViewportElementId = 'mweb-engine-viewport';
exports.ViewportInnerElementId = 'mweb-engine-viewport-inner';
