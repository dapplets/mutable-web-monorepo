import { IContextNode } from "../core/tree/types";
import { ParserConfig } from "../core/parsers/json-parser";
import { BosParserConfig } from "../core/parsers/bos-parser";

export type UserLinkId = string;
export type AppId = string;
export type MutationId = string;

export type DependantContext = {
  namespace: string;
  contextType: string;
  contextId: string | null;
};

export type BosUserLink = {
  id: UserLinkId;
  namespace: string;
  insertionPoint: string;
  bosWidgetId: string;
  authorId: string;
  // ToDo: add props
};

export type AppMetadataTarget = {
  if: Record<string, any>;
  injectTo: string;
};

export type AppMetadata = {
  id: AppId;
  authorId: string;
  appLocalId: string;
  namespaces: { [alias: string]: string };
  componentId: string;
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

export interface IProvider {
  // Read

  getParserConfigsForContext(
    context: IContextNode
  ): Promise<(ParserConfig | BosParserConfig)[]>;
  getParserConfig(
    namespace: string
  ): Promise<ParserConfig | BosParserConfig | null>;
  getAppsForContext(
    context: IContextNode,
    globalAppIds: AppId[]
  ): Promise<AppMetadata[]>;
  getLinksForContext(
    context: IContextNode,
    globalAppIds: AppId[]
  ): Promise<BosUserLink[]>;
  getApplication(globalAppId: string): Promise<AppMetadata | null>;
  getAllAppIds(): Promise<string[]>;
  getMutation(globalMutationId: string): Promise<Mutation | null>;
  getMutations(): Promise<Mutation[]>;

  // Write

  createLink(globalAppId: string, context: IContextNode): Promise<BosUserLink>;
  deleteUserLink(userLinkId: UserLinkId): Promise<void>;
  createApplication(appMetadata: AppMetadata): Promise<AppMetadata>;
  // ToDo: generalize parser config types
  createParserConfig(
    parserConfig: ParserConfig | BosParserConfig
  ): Promise<void>;
}
