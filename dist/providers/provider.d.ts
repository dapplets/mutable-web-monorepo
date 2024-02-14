import { ParserConfig } from "../core/parsers/json-parser";
import { BosParserConfig } from "../core/parsers/bos-parser";
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
};
export type ContextFilter = {
    namespace: string;
    contextType: string;
    contextId: string | null;
};
export type IndexedLink = {
    id: UserLinkId;
    authorId: string;
};
export type BosUserLink = {
    id: UserLinkId;
    namespace: string;
    insertionPoint: string;
    bosWidgetId: string;
    authorId: string;
};
export type AppMetadataTarget = {
    namespace: string;
    contextType: string;
    if: Record<string, TargetCondition>;
    componentId: string;
    injectTo: string;
    injectOnce?: boolean;
};
export type AppMetadata = {
    id: AppId;
    authorId: string;
    appLocalId: string;
    targets: AppMetadataTarget[];
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
};
export type LinkIndexObject = {
    appId: AppId;
    mutationId: MutationId;
    namespace: string;
    contextType: string;
    if: Record<string, ScalarType>;
};
export interface IProvider {
    getParserConfigsForContext(contextFilter: ContextFilter): Promise<(ParserConfig | BosParserConfig)[]>;
    getParserConfig(ns: string): Promise<ParserConfig | BosParserConfig | null>;
    getAllAppIds(): Promise<AppId[]>;
    getLinksByIndex(indexObject: LinkIndexObject): Promise<IndexedLink[]>;
    getApplication(globalAppId: AppId): Promise<AppMetadata | null>;
    getMutation(globalMutationId: MutationId): Promise<Mutation | null>;
    getMutations(): Promise<Mutation[]>;
    createLink(indexObject: LinkIndexObject): Promise<IndexedLink>;
    deleteUserLink(linkId: UserLinkId): Promise<void>;
    createApplication(appMetadata: Omit<AppMetadata, "authorId" | "appLocalId">): Promise<AppMetadata>;
    createMutation(mutation: Mutation): Promise<Mutation>;
    createParserConfig(config: ParserConfig): Promise<void>;
    setContextIdsForParser(parserGlobalId: string, contextsToBeAdded: ContextFilter[], contextsToBeDeleted: ContextFilter[]): Promise<void>;
}
//# sourceMappingURL=provider.d.ts.map