import { IAdapter } from "./core/adapters/interface";
import { Mutation } from "./providers/provider";
import { WalletSelector } from "@near-wallet-selector/core";
import { IContextListener, IContextNode, ITreeBuilder } from "./core/tree/types";
export declare enum AdapterType {
    Bos = "bos",
    Microdata = "microdata",
    Json = "json"
}
export type EngineConfig = {
    networkId: string;
    selector: WalletSelector;
};
export declare class Engine implements IContextListener {
    #private;
    private config;
    adapters: Set<IAdapter>;
    treeBuilder: ITreeBuilder | null;
    started: boolean;
    constructor(config: EngineConfig);
    handleContextStarted(context: IContextNode): Promise<void>;
    handleContextChanged(context: IContextNode, oldParsedContext: any): void;
    handleContextFinished(context: IContextNode): void;
    handleInsPointStarted(context: IContextNode, newInsPoint: string): void;
    handleInsPointFinished(context: IContextNode, oldInsPoint: string): void;
    start(mutationId?: string): Promise<void>;
    stop(): void;
    getMutations(): Promise<Mutation[]>;
    switchMutation(mutationId: string): Promise<void>;
    getCurrentMutation(): Promise<Mutation | null>;
    registerAdapter(adapter: IAdapter): void;
    unregisterAdapter(adapter: IAdapter): void;
    getParserType(ns: string): AdapterType | null;
    createAdapter(type: AdapterType, config?: any): IAdapter;
}
//# sourceMappingURL=engine.d.ts.map