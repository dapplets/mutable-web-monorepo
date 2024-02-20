export type NearConfig = {
    networkId: string;
    nodeUrl: string;
    contractName: string;
    walletUrl: string;
};
export declare const NearConfigs: {
    [networkId: string]: NearConfig;
};
export declare const getNearConfig: (networkId: string) => NearConfig;
export declare const DappletsEngineNs = "engine";
//# sourceMappingURL=constants.d.ts.map