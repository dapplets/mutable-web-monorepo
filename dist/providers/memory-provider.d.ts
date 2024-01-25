import { BosParserConfig } from "../core/parsers/bos-parser";
import { ParserConfig } from "../core/parsers/json-parser";
import { IContextNode } from "../core/tree/types";
import { BosUserLink, IProvider, LinkTemplate } from "./provider";
export declare class MemoryProvider implements IProvider {
    getParserConfigsForContext(context: IContextNode): Promise<(ParserConfig | BosParserConfig)[]>;
    createLinkTemplate(linkTemplate: Omit<LinkTemplate, "id">): Promise<LinkTemplate>;
    getParserConfig(namespace: string): Promise<ParserConfig | null>;
    createParserConfig(parserConfig: ParserConfig): Promise<void>;
    getLinksForContext(context: IContextNode): Promise<BosUserLink[]>;
    createLink(link: Omit<BosUserLink, "id">): Promise<BosUserLink>;
    getLinkTemplates(bosWidgetId: string): Promise<LinkTemplate[]>;
    deleteUserLink(userLink: Pick<BosUserLink, "id" | "bosWidgetId">): Promise<void>;
}
//# sourceMappingURL=memory-provider.d.ts.map