import { IContextNode } from '../core';
import { AppId, AppMetadata, AppMetadataTarget, BosUserLink, IProvider, LinkIndexObject, Mutation, MutationId, ParserConfig, ScalarType, TargetCondition, UserLinkId } from './providers/provider';
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
    getMutationsForContext(context: IContextNode): Promise<Mutation[]>;
    filterSuitableApps(context: IContextNode, includedApps?: string[]): AppMetadata[];
    getLinksForContext(context: IContextNode, includedApps?: string[]): Promise<BosUserLink[]>;
    filterSuitableParsers(context: IContextNode): ParserConfig[];
    switchMutation(mutation: Mutation | null): Promise<void>;
    createLink(appGlobalId: AppId, context: IContextNode): Promise<BosUserLink>;
    deleteUserLink(userLinkId: UserLinkId): Promise<void>;
    loadApp(appId: string): Promise<AppMetadata>;
    unloadApp(appId: string): Promise<void>;
    loadParser(parserId: string): Promise<ParserConfig>;
    unloadParser(parserId: string): Promise<void>;
    private _getUserLinksForTarget;
    static _buildLinkIndex(appId: AppId, mutationId: MutationId, target: AppMetadataTarget, context: IContextNode): LinkIndexObject;
    static _buildIndexedContextValues(conditions: Record<string, TargetCondition>, values: Record<string, ScalarType>): Record<string, ScalarType>;
    static _isTargetMet(target: Pick<AppMetadataTarget, 'namespace' | 'contextType' | 'if'>, context: Pick<IContextNode, 'namespace' | 'contextType' | 'parsedContext'>): boolean;
    static _areConditionsMet(conditions: Record<string, TargetCondition>, values: Record<string, ScalarType>): boolean;
    static _isConditionMet(condition: TargetCondition, value: ScalarType): boolean;
}
//# sourceMappingURL=mutation-manager.d.ts.map