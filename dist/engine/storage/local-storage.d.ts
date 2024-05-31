import { IStorage } from './storage';
export declare class LocalStorage implements IStorage {
    private _keyPrefix;
    constructor(_keyPrefix?: string);
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    private _makeKey;
}
//# sourceMappingURL=local-storage.d.ts.map