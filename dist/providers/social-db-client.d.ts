import { NearSigner } from './near-signer';
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
    keys(keys: string[]): Promise<string[]>;
    set(data: Value): Promise<void>;
    delete(keys: string[]): Promise<void>;
    private _getAccountStorage;
    static _nullifyData(data: any): any;
}
//# sourceMappingURL=social-db-client.d.ts.map