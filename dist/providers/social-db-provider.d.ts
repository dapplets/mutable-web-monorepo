import { NearSigner } from "./near-signer";
import { ParserConfig } from "../core/parsers/json-parser";
import { AppMetadata, ContextFilter, IProvider, UserLinkId, AppId, Mutation, IndexedLink, LinkIndexObject, MutationId } from "./provider";
import { BosParserConfig } from "../core/parsers/bos-parser";
/**
 * All Mutable Web data is stored in the Social DB contract in `settings` namespace.
 * More info about the schema is here:
 * https://github.com/NearSocial/standards/blob/8713aed325226db5cf97ab9744ba78b561cc377b/types/settings/Settings.md
 *
 * Example of a data stored in the contract is here:
 * /docs/social-db-reference.json
 */
export declare class SocialDbProvider implements IProvider {
    #private;
    private _signer;
    constructor(_signer: NearSigner, _contractName: string);
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
    private _extractParserIdFromNamespace;
    static _buildNestedData(keys: string[], data: any): any;
    static _splitObjectByDepth(obj: any, depth?: number, path?: string[]): any;
    /**
     * Hashes object using deterministic serializator, SHA-256 and base64url encoding
     */
    static _hashObject(obj: any): string;
    /**
     * Source: https://gist.github.com/themikefuller/c1de46cbbdad02645b9dc006baedf88e
     */
    static _base64EncodeURL(byteArray: ArrayLike<number> | ArrayBufferLike): string;
    static _getValueByKey(keys: string[], obj: any): any;
}
//# sourceMappingURL=social-db-provider.d.ts.map