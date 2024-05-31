/// <reference types="react" />
import { BosComponent } from './bos/bos-widget';
import { ContextManager } from './context-manager';
import { IContextNode } from '../core';
import { AppId, AppMetadata, BosUserLink, InjectableTarget, UserLinkId } from './providers/provider';
export interface LayoutManagerProps {
    context: ContextTreeProps;
    apps: {
        id: string;
        metadata?: {
            name?: string;
            description?: string;
            image?: {
                ipfs_cid?: string;
            };
        };
    }[];
    widgets: {
        linkId: UserLinkId;
        linkAuthorId: string;
        src: string;
        props: {
            context: ContextTreeProps;
            link: {
                id: UserLinkId;
                authorId: string;
            };
        };
    }[];
    components: {
        target: InjectableTarget;
        component: React.FC<unknown>;
    }[];
    isEditMode: boolean;
    createUserLink: (bosWidgetId: string) => Promise<void>;
    deleteUserLink: (userLinkId: UserLinkId) => Promise<void>;
    enableEditMode: () => void;
    disableEditMode: () => void;
    attachContextRef: (callback: (r: React.Component | Element | null | undefined) => void) => void;
    attachInsPointRef: (callback: (r: React.Component | Element | null | undefined) => void) => void;
}
interface ContextTreeProps {
    namespace: string | null;
    type: string;
    id: string | null;
    parsed: any;
    parent: ContextTreeProps | null;
}
export declare class LayoutManager {
    #private;
    constructor(layoutManager: BosComponent, contextElement: Element, insPointElement: Element, contextManager: ContextManager);
    addUserLink(userLink: BosUserLink, isSuitable: boolean): void;
    removeUserLink(userLinkId: UserLinkId): void;
    addAppMetadata(appMetadata: AppMetadata): void;
    removeAppMetadata(globalAppId: AppId): void;
    enableEditMode(): void;
    disableEditMode(): void;
    setRedirectMap(redirectMap: any): void;
    forceUpdate(): void;
    injectComponent<T>(target: InjectableTarget, cmp: React.FC<T>): void;
    unjectComponent<T>(_: InjectableTarget, cmp: React.FC<T>): void;
    destroy(): void;
    _setProps(props: LayoutManagerProps): void;
    _createUserLink(globalAppId: string): Promise<void>;
    _deleteUserLink(userLinkId: UserLinkId): Promise<void>;
    _enableEditMode(): void;
    _disableEditMode(): void;
    _attachContextRef(callback: (r: React.Component | Element | null | undefined) => void): void;
    _attachInsPointRef(callback: (r: React.Component | Element | null | undefined) => void): void;
    static _buildContextTree(context: IContextNode): ContextTreeProps;
}
export {};
//# sourceMappingURL=layout-manager.d.ts.map