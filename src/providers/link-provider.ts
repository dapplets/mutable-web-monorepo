import { IContextNode } from "../core/tree/types";

export type BosUserLink = {
  namespace: string;
  contextType: string; // ToDo: replace with expression
  contextId: string | null; // ToDo: replace with expression
  insertionPoint: string;
  insertionType: string;
  component: string;
  // ToDo: add props
};

export interface ILinkProvider {
  getLinksForContext(context: IContextNode): Promise<BosUserLink[]>;
  createLink(link: BosUserLink): Promise<void>;
}
