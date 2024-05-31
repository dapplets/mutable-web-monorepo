import { IStorage } from './storage';
export declare class JsonStorage {
    storage: IStorage;
    constructor(storage: IStorage);
    getItem<Value>(key: string): Promise<Value | null | undefined>;
    setItem<Value>(key: string, value: Value | null | undefined): Promise<void>;
}
//# sourceMappingURL=json-storage.d.ts.map