"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewportInnerElementId = exports.ViewportElementId = exports.bosLoaderUrl = exports.getNearConfig = exports.NearConfigs = void 0;
exports.NearConfigs = {
    mainnet: {
        networkId: 'mainnet',
        nodeUrl: 'https://mainnet.near.dapplets.org',
        contractName: 'social.dapplets.near',
        walletUrl: 'https://app.mynearwallet.com',
        defaultMutationId: 'bos.dapplets.near/mutation/Sandbox',
        layoutManagers: {
            vertical: 'bos.dapplets.near/widget/VerticalLayoutManager',
            horizontal: 'bos.dapplets.near/widget/DefaultLayoutManager',
            ear: 'bos.dapplets.near/widget/ContextActionsGroup',
        },
    },
    testnet: {
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        contractName: 'social.dapplets.testnet',
        walletUrl: 'https://testnet.mynearwallet.com',
        defaultMutationId: 'bos.dapplets.testnet/mutation/Sandbox',
        layoutManagers: {
            vertical: 'bos.dapplets.testnet/widget/VerticalLayoutManager',
            horizontal: 'bos.dapplets.testnet/widget/DefaultLayoutManager',
            ear: 'bos.dapplets.testnet/widget/ContextActionsGroup',
        },
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
