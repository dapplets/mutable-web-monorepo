import { NearSigner } from '../near-signer/near-signer.service';
export type StorageUsage = string;
export type StorageView = {
    usedBytes: StorageUsage;
    availableBytes: StorageUsage;
};
export type Value = any;
/**
 * ToDo: rename to DataSource
 */
export declare class SocialDbService {
    private _signer;
    private _contractName;
    constructor(_signer: NearSigner, _contractName: string);
    get(keys: string[]): Promise<Value>;
    keys(keys: string[]): Promise<string[]>;
    set(originalData: Value): Promise<void>;
    delete(keys: string[]): Promise<void>;
    private _getAccountStorage;
    private _fetchCurrentData;
    static _nullifyData(data: any): any;
    static buildNestedData(keys: string[], data: any): any;
    static splitObjectByDepth(obj: any, depth?: number, path?: string[]): any;
    static getValueByKey(keys: string[], obj: any): any;
}
//# sourceMappingURL=social-db.service.d.ts.map