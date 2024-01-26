import { BosWidgetFactory } from "./bos/bos-widget-factory";
import { IAdapter } from "./core/adapters/interface";
import { IContextNode } from "./core/tree/types";
import { BosUserLink, IProvider } from "./providers/provider";
export type InsertionPointName = string;
export declare class ContextManager {
    #private;
    readonly context: IContextNode;
    constructor(context: IContextNode, adapter: IAdapter, widgetFactory: BosWidgetFactory, provider: IProvider);
    forceUpdate(): void;
    enableEditMode(): void;
    disableEditMode(): void;
    addUserLink(link: BosUserLink): void;
    removeUserLink(link: BosUserLink): void;
    createUserLink(bosWidgetId: string): Promise<void>;
    deleteUserLink(userLink: BosUserLink): Promise<void>;
    injectLayoutManager(insPointName: string): void;
}
//# sourceMappingURL=context-manager.d.ts.map