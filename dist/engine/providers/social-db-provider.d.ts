import { NearSigner } from './near-signer';
import { AppMetadata, IProvider, UserLinkId, AppId, Mutation, IndexedLink, LinkIndexObject, MutationId, ParserConfig } from './provider';
import { SocialDbClient } from './social-db-client';
/**
 * All Mutable Web data is stored in the Social DB contract in `settings` namespace.
 * More info about the schema is here:
 * https://github.com/NearSocial/standards/blob/8713aed325226db5cf97ab9744ba78b561cc377b/types/settings/Settings.md
 *
 * Example of a data stored in the contract is here:
 * /docs/social-db-reference.json
 */
export declare class SocialDbProvider implements IProvider {
    private _signer;
    client: SocialDbClient;
    constructor(_signer: NearSigner, _contractName: string);
    getParserConfig(globalParserId: string): Promise<ParserConfig | null>;
    getLinksByIndex(indexObject: LinkIndexObject): Promise<IndexedLink[]>;
    getApplication(globalAppId: AppId): Promise<AppMetadata | null>;
    getApplications(): Promise<AppMetadata[]>;
    getMutation(globalMutationId: MutationId): Promise<Mutation | null>;
    getMutations(): Promise<Mutation[]>;
    createLink(indexObject: LinkIndexObject): Promise<IndexedLink>;
    deleteUserLink(linkId: UserLinkId): Promise<void>;
    saveApplication(appMetadata: Omit<AppMetadata, 'authorId' | 'appLocalId'>): Promise<AppMetadata>;
    saveMutation(mutation: Mutation): Promise<Mutation>;
    saveParserConfig(config: ParserConfig): Promise<void>;
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
    static _generateGuid(): string;
}
//# sourceMappingURL=social-db-provider.d.ts.map