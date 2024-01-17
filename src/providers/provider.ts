import { IContextNode } from "../core/tree/types";
import { ParserConfig } from "../core/parsers/json-parser";

export type BosUserLink = {
  id: string;
  namespace: string;
  contextType: string; // ToDo: replace with expression
  contextId: string | null; // ToDo: replace with expression
  insertionPoint: string;
  component: string;
  // ToDo: add props
};

export interface IProvider {
  getLinksForContext(context: IContextNode): Promise<BosUserLink[]>;
  createLink(link: Omit<BosUserLink, "id">): Promise<BosUserLink>;
  getParserConfig(namespace: string): Promise<ParserConfig | null>;
  createParserConfig(parserConfig: ParserConfig): Promise<void>;
}
