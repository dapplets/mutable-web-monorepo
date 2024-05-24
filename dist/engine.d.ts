/// <reference types="react" />
import { IAdapter } from './core/adapters/interface';
import { AppMetadata, AppWithSettings, InjectableTarget, Mutation, MutationWithSettings, ParserConfig } from './providers/provider';
import { WalletSelector } from '@near-wallet-selector/core';
import { IContextListener, IContextNode, ITreeBuilder } from './core/tree/types';
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
export declare class Engine implements IContextListener {
    #private;
    private config;
    adapters: Map<string, IAdapter>;
    treeBuilder: ITreeBuilder | null;
    started: boolean;
    constructor(config: EngineConfig);
    handleContextStarted(context: IContextNode): Promise<void>;
    handleContextChanged(context: IContextNode, oldParsedContext: any): void;
    handleContextFinished(context: IContextNode): void;
    handleInsPointStarted(context: IContextNode, newInsPoint: string): void;
    handleInsPointFinished(context: IContextNode, oldInsPoint: string): void;
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
    registerAdapter(adapter: IAdapter): void;
    unregisterAdapter(adapter: IAdapter): void;
    createAdapter(config: ParserConfig): IAdapter;
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