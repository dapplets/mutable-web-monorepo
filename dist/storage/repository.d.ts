import { JsonStorage } from './json-storage';
export declare class Repository {
    jsonStorage: JsonStorage;
    constructor(jsonStorage: JsonStorage);
    getFavoriteMutation(): Promise<string | null | undefined>;
    setFavoriteMutation(mutationId: string | null | undefined): Promise<void>;
    getMutationLastUsage(mutationId: string, hostname: string): Promise<string | null>;
    setMutationLastUsage(mutationId: string, value: string | null, hostname: string): Promise<void>;
    private _get;
    private _set;
    private _makeKey;
}
//# sourceMappingURL=repository.d.ts.map