export type NearConfig = {
    networkId: string;
    nodeUrl: string;
    contractName: string;
    walletUrl: string;
    defaultMutationId: string;
    defaultLayoutManager: string;
};
export declare const NearConfigs: {
    [networkId: string]: NearConfig;
};
export declare const getNearConfig: (networkId: string) => NearConfig;
export declare const DappletsEngineNs = "engine";
export declare const bosLoaderUrl = "http://127.0.0.1:3030/";
//# sourceMappingURL=constants.d.ts.map