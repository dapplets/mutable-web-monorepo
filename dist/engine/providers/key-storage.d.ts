import { KeyPair, keyStores } from 'near-api-js';
import { JsonStorage } from '../storage/json-storage';
export declare class KeyStorage extends keyStores.KeyStore {
    private _storage;
    private prefix;
    constructor(_storage: JsonStorage, keyStorePrefix?: string);
    setKey(networkId: string, accountId: string, keyPair: KeyPair): Promise<void>;
    getKey(networkId: string, accountId: string): Promise<KeyPair>;
    removeKey(networkId: string, accountId: string): Promise<void>;
    clear(): Promise<void>;
    getNetworks(): Promise<string[]>;
    getAccounts(networkId: string): Promise<string[]>;
    private storageKeyForSecretKey;
    private storageKeyForStorageKeysArray;
    private storageKeys;
    private registerStorageKey;
    private unregisterStorageKey;
}
//# sourceMappingURL=key-storage.d.ts.map