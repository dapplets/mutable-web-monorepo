import { IStorage } from './local-storage';
/**
 * ToDo: rename to DataSource
 */
export declare class LocalDbService {
    storage: IStorage;
    constructor(storage: IStorage);
    getItem<Value>(key: string): Promise<Value | null | undefined>;
    setItem<Value>(key: string, value: Value | null | undefined): Promise<void>;
    static makeKey(...keys: string[]): string;
}
//# sourceMappingURL=local-db.service.d.ts.map