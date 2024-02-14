import { IContextNode } from "./core/tree/types";
import { AppId, AppMetadata, AppMetadataTarget, BosUserLink, IProvider, LinkIndexObject, Mutation, MutationId, ScalarType, TargetCondition, UserLinkId } from "./providers/provider";
export type AppWithTargetLinks = AppMetadata & {
    targets: {
        links: BosUserLink[];
    }[];
};
export declare class MutationManager {
    #private;
    mutation: Mutation | null;
    constructor(provider: IProvider);
    getAppsAndLinksForContext(context: IContextNode): Promise<AppWithTargetLinks[]>;
    filterSuitableApps(context: IContextNode): Promise<AppMetadata[]>;
    getLinksForContext(context: IContextNode): Promise<BosUserLink[]>;
    switchMutation(mutationId: string): Promise<void>;
    createLink(appGlobalId: AppId, context: IContextNode): Promise<BosUserLink>;
    deleteUserLink(userLinkId: UserLinkId): Promise<void>;
    private _getUserLinksForTarget;
    static _buildLinkIndex(appId: AppId, mutationId: MutationId, target: AppMetadataTarget, context: IContextNode): LinkIndexObject;
    static _buildIndexedContextValues(conditions: Record<string, TargetCondition>, values: Record<string, ScalarType>): Record<string, ScalarType>;
    static _isTargetMet(target: Pick<AppMetadataTarget, "namespace" | "contextType" | "if">, context: Pick<IContextNode, "namespaceURI" | "tagName" | "parsedContext">): boolean;
    static _areConditionsMet(conditions: Record<string, TargetCondition>, values: Record<string, ScalarType>): boolean;
    static _isConditionMet(condition: TargetCondition, value: ScalarType): boolean;
}
//# sourceMappingURL=mutation-manager.d.ts.map