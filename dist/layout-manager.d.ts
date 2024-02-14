import { BosComponent } from "./bos/bos-widget";
import { ContextManager } from "./context-manager";
import { IContextNode } from "./core/tree/types";
import { AppId, AppMetadata, BosUserLink, UserLinkId } from "./providers/provider";
export interface LayoutManagerProps {
    context: any;
    contextType: string;
    apps: {
        id: string;
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
    isEditMode: boolean;
    createUserLink: (bosWidgetId: string) => Promise<void>;
    deleteUserLink: (userLinkId: UserLinkId) => Promise<void>;
    enableEditMode: () => void;
    disableEditMode: () => void;
}
interface ContextTreeProps {
    namespace: string | null;
    type: string;
    parsed: any;
    parent: ContextTreeProps | null;
}
export declare class LayoutManager {
    #private;
    constructor(layoutManager: BosComponent, contextManager: ContextManager);
    addUserLink(userLink: BosUserLink): void;
    removeUserLink(userLinkId: UserLinkId): void;
    addAppMetadata(appMetadata: AppMetadata): void;
    removeAppMetadata(globalAppId: AppId): void;
    enableEditMode(): void;
    disableEditMode(): void;
    forceUpdate(): void;
    destroy(): void;
    _setProps(props: LayoutManagerProps): void;
    _createUserLink(globalAppId: string): Promise<void>;
    _deleteUserLink(userLinkId: UserLinkId): Promise<void>;
    _enableEditMode(): void;
    _disableEditMode(): void;
    static _buildContextTree(context: IContextNode): ContextTreeProps;
}
export {};
//# sourceMappingURL=layout-manager.d.ts.map