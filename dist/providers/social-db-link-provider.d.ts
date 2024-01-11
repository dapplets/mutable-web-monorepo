import { BosUserLink, ILinkProvider } from "./link-provider";
import { NearSigner } from "./near-signer";
import { IContextNode } from "../core/tree/types";
export declare class SocialDbLinkProvider implements ILinkProvider {
    private _signer;
    private _contractName;
    constructor(_signer: NearSigner, _contractName: string);
    getLinksForContext(context: IContextNode): Promise<BosUserLink[]>;
    createLink(link: BosUserLink): Promise<void>;
}
//# sourceMappingURL=social-db-link-provider.d.ts.map