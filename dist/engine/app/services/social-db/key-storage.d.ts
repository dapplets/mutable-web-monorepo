import { KeyPair, keyStores } from 'near-api-js';
import { LocalDbService } from '../local-db/local-db.service';
export declare class KeyStorage extends keyStores.KeyStore {
    private _storage;
    private prefix;
    constructor(_storage: LocalDbService, keyStorePrefix?: string);
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