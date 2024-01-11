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
//# sourceMappingURL=constants.d.ts.map