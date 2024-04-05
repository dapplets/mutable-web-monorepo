import { IStorage } from './storage';
export declare class JsonStorage {
    storage: IStorage;
    constructor(storage: IStorage);
    getItem<Value>(key: string): Promise<Value | null>;
    setItem<Value>(key: string, value: Value): Promise<void>;
    removeItem(key: string): Promise<void>;
}
//# sourceMappingURL=json-storage.d.ts.map