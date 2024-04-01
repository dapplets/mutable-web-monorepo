export type UserLinkId = string;
export type AppId = string;
export type MutationId = string;
export type ScalarType = string | number | boolean | null;
export type LinkIndex = string;
export type TargetCondition = {
    not?: ScalarType;
    eq?: ScalarType;
    contains?: string;
    in?: ScalarType[];
    index?: boolean;
    endsWith?: string;
};
export type IndexedLink = {
    id: UserLinkId;
    authorId: string;
};
export type BosUserLink = {
    id: UserLinkId;
    appId: string;
    namespace: string;
    insertionPoint: string;
    bosWidgetId: string;
    authorId: string;
};
export type ContextTarget = {
    namespace: string;
    contextType: string;
    if: Record<string, TargetCondition>;
};
export type AppMetadataTarget = ContextTarget & {
    componentId: string;
    injectTo: string;
    injectOnce?: boolean;
};
export type AppMetadata = {
    id: AppId;
    authorId: string;
    appLocalId: string;
    targets: AppMetadataTarget[];
    metadata?: {
        name?: string;
        description?: string;
        image?: {
            ipfs_cid?: string;
        };
    };
};
export type Mutation = {
    id: MutationId;
    metadata?: {
        name?: string;
        description?: string;
        image?: {
            ipfs_cid?: string;
        };
    };
    apps: string[];
    targets: ContextTarget[];
};
export type LinkIndexObject = {
    appId: AppId;
    mutationId: MutationId;
    namespace: string;
    contextType: string;
    if: Record<string, ScalarType>;
};
export type ParserConfig = {
    id: string;
    parserType: string;
    contexts: any;
    targets: ContextTarget[];
};
export interface IProvider {
    getParserConfig(globalParserId: string): Promise<ParserConfig | null>;
    getLinksByIndex(indexObject: LinkIndexObject): Promise<IndexedLink[]>;
    getApplication(globalAppId: AppId): Promise<AppMetadata | null>;
    getMutation(globalMutationId: MutationId): Promise<Mutation | null>;
    getMutations(): Promise<Mutation[]>;
    createLink(indexObject: LinkIndexObject): Promise<IndexedLink>;
    deleteUserLink(linkId: UserLinkId): Promise<void>;
    createApplication(appMetadata: Omit<AppMetadata, 'authorId' | 'appLocalId'>): Promise<AppMetadata>;
    createMutation(mutation: Mutation): Promise<Mutation>;
    createParserConfig(config: ParserConfig): Promise<void>;
}
//# sourceMappingURL=provider.d.ts.map