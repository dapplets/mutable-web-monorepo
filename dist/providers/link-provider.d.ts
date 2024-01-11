import { IContextNode } from "../core/tree/types";
export type BosUserLink = {
    namespace: string;
    contextType: string;
    contextId: string | null;
    insertionPoint: string;
    insertionType: string;
    component: string;
};
export interface ILinkProvider {
    getLinksForContext(context: IContextNode): Promise<BosUserLink[]>;
    createLink(link: BosUserLink): Promise<void>;
}
//# sourceMappingURL=link-provider.d.ts.map