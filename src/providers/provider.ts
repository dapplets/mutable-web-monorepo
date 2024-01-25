import { IContextNode } from "../core/tree/types";
import { ParserConfig } from "../core/parsers/json-parser";
import { BosParserConfig } from "../core/parsers/bos-parser";

export type UserLinkId = string;

export type DependantContext = {
  namespace: string;
  contextType: string;
  contextId: string | null;
};

export type BosUserLink = {
  id: UserLinkId;
  namespace: string;
  contextType: string; // ToDo: replace with expression
  contextId: string | null; // ToDo: replace with expression
  insertionPoint: string;
  bosWidgetId: string;
  authorId: string;
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
  getParserConfigsForContext(
    context: IContextNode
  ): Promise<(ParserConfig | BosParserConfig)[]>;
  getLinksForContext(context: IContextNode): Promise<BosUserLink[]>;
  createLink(link: Omit<BosUserLink, "id" | "authorId">): Promise<BosUserLink>;
  // ToDo: generic parser config
  getParserConfig(
    namespace: string
  ): Promise<ParserConfig | BosParserConfig | null>;
  createParserConfig(
    parserConfig: ParserConfig | BosParserConfig
  ): Promise<void>;
  getLinkTemplates(bosWidgetId: string): Promise<LinkTemplate[]>;
  createLinkTemplate(
    linkTemplate: Omit<LinkTemplate, "id">
  ): Promise<LinkTemplate>;
  deleteUserLink(
    userLink: Pick<BosUserLink, "id" | "bosWidgetId">
  ): Promise<void>;
}
