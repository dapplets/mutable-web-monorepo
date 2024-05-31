/// <reference types="react" />
import { BosWidgetFactory } from './bos/bos-widget-factory';
import { IAdapter, IContextNode } from '../core';
import { MutationManager } from './mutation-manager';
import { AppId, AppMetadata, BosUserLink, InjectableTarget } from './providers/provider';
export type InsertionPointName = string;
export declare class ContextManager {
    #private;
    readonly context: IContextNode;
    constructor(context: IContextNode, adapter: IAdapter, widgetFactory: BosWidgetFactory, mutationManager: MutationManager, defaultLayoutManager: string);
    forceUpdate(): void;
    enableEditMode(): void;
    disableEditMode(): void;
    addUserLink(link: BosUserLink): void;
    removeUserLink(link: BosUserLink): void;
    addAppMetadata(appMetadata: AppMetadata): void;
    removeAppMetadata(appGlobalId: AppId): void;
    createUserLink(globalAppId: AppId): Promise<void>;
    deleteUserLink(userLink: BosUserLink): Promise<void>;
    setRedirectMap(redirectMap: any): void;
    injectLayoutManager(insPointName: string): void;
    destroyLayoutManager(insPointName: string): void;
    destroy(): void;
    injectComponent<T>(target: InjectableTarget, cmp: React.FC<T>): void;
    unjectComponent<T>(target: InjectableTarget, cmp: React.FC<T>): void;
    private _isTargetInjectable;
}
//# sourceMappingURL=context-manager.d.ts.map