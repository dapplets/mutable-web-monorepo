import { NearSigner } from "./near-signer";
export type StorageUsage = string;
export type StorageView = {
    usedBytes: StorageUsage;
    availableBytes: StorageUsage;
};
export type Value = any;
export declare class SocialDbClient {
    private _signer;
    private _contractName;
    constructor(_signer: NearSigner, _contractName: string);
    get(keys: string[]): Promise<Value>;
    set(data: Value): Promise<void>;
    private _getAccountStorage;
}
//# sourceMappingURL=social-db-client.d.ts.map