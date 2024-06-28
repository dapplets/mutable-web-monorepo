import { SocialDbService } from '../social-db/social-db.service';
import { IndexedLink, LinkIndexObject, UserLinkId } from './user-link.entity';
import { NearSigner } from '../near-signer/near-signer.service';
export declare class UserLinkRepository {
    private _socialDb;
    private _signer;
    constructor(_socialDb: SocialDbService, _signer: NearSigner);
    getLinksByIndex(indexObject: LinkIndexObject): Promise<IndexedLink[]>;
    createLink(indexObject: LinkIndexObject): Promise<IndexedLink>;
    deleteUserLink(linkId: UserLinkId): Promise<void>;
    /**
     * Hashes object using deterministic serializator, SHA-256 and base64url encoding
     */
    static _hashObject(obj: any): string;
    /**
     * Source: https://gist.github.com/themikefuller/c1de46cbbdad02645b9dc006baedf88e
     */
    static _base64EncodeURL(byteArray: ArrayLike<number> | ArrayBufferLike): string;
    static _generateGuid(): string;
}
//# sourceMappingURL=user-link.repository.d.ts.map