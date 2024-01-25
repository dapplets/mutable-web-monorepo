import { NearSigner } from "./near-signer";
import { ParserConfig } from "../core/parsers/json-parser";
import { BosUserLink, DependantContext, IProvider, LinkTemplate } from "./provider";
import { IContextNode } from "../core/tree/types";
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
    getParserConfigsForContext(context: IContextNode): Promise<(ParserConfig | BosParserConfig)[]>;
    getParserConfig(ns: string): Promise<ParserConfig | BosParserConfig | null>;
    createParserConfig(config: ParserConfig): Promise<void>;
    getLinksForContext(context: IContextNode): Promise<BosUserLink[]>;
    createLink(link: Omit<BosUserLink, "id" | "authorId">): Promise<BosUserLink>;
    deleteUserLink(userLink: Pick<BosUserLink, "id" | "bosWidgetId">): Promise<void>;
    getLinkTemplates(bosWidgetId: string): Promise<LinkTemplate[]>;
    createLinkTemplate(linkTemplate: Omit<LinkTemplate, "id">): Promise<LinkTemplate>;
    deleteLinkTemplate(linkTemplate: Pick<BosUserLink, "id" | "bosWidgetId">): Promise<void>;
    setContextIdsForParser(parserGlobalId: string, contextsToBeAdded: DependantContext[], contextsToBeDeleted: DependantContext[]): Promise<void>;
    private _extractParserIdFromNamespace;
    private _buildNestedData;
}
//# sourceMappingURL=social-db-provider.d.ts.map