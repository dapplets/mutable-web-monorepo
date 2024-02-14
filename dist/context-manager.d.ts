import { BosWidgetFactory } from "./bos/bos-widget-factory";
import { IAdapter } from "./core/adapters/interface";
import { IContextNode } from "./core/tree/types";
import { MutationManager } from "./mutation-manager";
import { AppId, AppMetadata, BosUserLink } from "./providers/provider";
export type InsertionPointName = string;
export declare class ContextManager {
    #private;
    readonly context: IContextNode;
    constructor(context: IContextNode, adapter: IAdapter, widgetFactory: BosWidgetFactory, mutationManager: MutationManager);
    forceUpdate(): void;
    enableEditMode(): void;
    disableEditMode(): void;
    addUserLink(link: BosUserLink): void;
    removeUserLink(link: BosUserLink): void;
    addAppMetadata(appMetadata: AppMetadata): void;
    removeAppMetadata(app: AppMetadata): void;
    createUserLink(globalAppId: AppId): Promise<void>;
    deleteUserLink(userLink: BosUserLink): Promise<void>;
    injectLayoutManager(insPointName: string): void;
    destroy(): void;
}
//# sourceMappingURL=context-manager.d.ts.map