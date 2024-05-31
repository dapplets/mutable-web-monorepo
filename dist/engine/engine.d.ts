/// <reference types="react" />
import { IContextNode, Core } from '../core';
import { AppMetadata, AppWithSettings, InjectableTarget, Mutation, MutationWithSettings } from './providers/provider';
import { WalletSelector } from '@near-wallet-selector/core';
import { IStorage } from './storage/storage';
export type EngineConfig = {
    networkId: string;
    gatewayId: string;
    selector: WalletSelector;
    storage?: IStorage;
    bosElementName?: string;
    bosElementStyleSrc?: string;
};
export declare let engineSingleton: Engine | null;
export declare class Engine {
    #private;
    private config;
    started: boolean;
    core: Core;
    constructor(config: EngineConfig);
    handleContextStarted({ context }: {
        context: IContextNode;
    }): Promise<void>;
    handleContextChanged({ context }: {
        context: IContextNode;
    }): void;
    handleContextFinished({ context }: {
        context: IContextNode;
    }): void;
    handleInsPointStarted({ context, insertionPoint, }: {
        context: IContextNode;
        insertionPoint: string;
    }): void;
    handleInsPointFinished({ context, insertionPoint, }: {
        context: IContextNode;
        insertionPoint: string;
    }): void;
    getLastUsedMutation: () => Promise<string | null>;
    start(mutationId?: string | null): Promise<void>;
    stop(): void;
    getMutations(): Promise<MutationWithSettings[]>;
    switchMutation(mutationId: string): Promise<void>;
    getCurrentMutation(): Promise<MutationWithSettings | null>;
    enableDevMode(options?: {
        polling: boolean;
    }): Promise<void>;
    disableDevMode(): void;
    setFavoriteMutation(mutationId: string | null): Promise<void>;
    getFavoriteMutation(): Promise<string | null>;
    removeMutationFromRecents(mutationId: string): Promise<void>;
    getApplications(): Promise<AppMetadata[]>;
    createMutation(mutation: Mutation): Promise<MutationWithSettings>;
    editMutation(mutation: Mutation): Promise<MutationWithSettings>;
    injectComponent<T>(target: InjectableTarget, cmp: React.FC<T>): void;
    unjectComponent<T>(target: InjectableTarget, cmp: React.FC<T>): void;
    getAppsFromMutation(mutationId: string): Promise<AppWithSettings[]>;
    enableApp(appId: string): Promise<void>;
    disableApp(appId: string): Promise<void>;
    private _tryFetchAndUpdateRedirects;
    private _updateRootContext;
    private _populateMutationWithSettings;
    private _populateAppWithSettings;
    private _attachViewport;
    private _detachViewport;
    private _startApp;
    private _stopApp;
    private _addAppsAndLinks;
    private _removeAppsAndLinks;
    private _traverseContextTree;
}
//# sourceMappingURL=engine.d.ts.map