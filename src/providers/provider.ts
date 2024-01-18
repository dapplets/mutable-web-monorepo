import { IContextNode } from "../core/tree/types";
import { ParserConfig } from "../core/parsers/json-parser";

export type BosUserLink = {
  id: string;
  namespace: string;
  contextType: string; // ToDo: replace with expression
  contextId: string | null; // ToDo: replace with expression
  insertionPoint: string;
  bosWidgetId: string;
  // ToDo: add props
};

export type LinkTemplate = {
  id: string;
  namespace: string;
  contextType: string;
  contextId: string | null;
  insertionPoint: string;
  bosWidgetId: string;
};

export interface IProvider {
  getLinksForContext(context: IContextNode): Promise<BosUserLink[]>;
  createLink(link: Omit<BosUserLink, "id">): Promise<BosUserLink>;
  getParserConfig(namespace: string): Promise<ParserConfig | null>;
  createParserConfig(parserConfig: ParserConfig): Promise<void>;
  getLinkTemplates(bosWidgetId: string): Promise<LinkTemplate[]>;
  createLinkTemplate(
    linkTemplate: Omit<LinkTemplate, "id">
  ): Promise<LinkTemplate>;
  deleteUserLink(
    userLink: Pick<BosUserLink, "id" | "bosWidgetId">
  ): Promise<void>;
}
