import { IAdapter } from "./core/adapters/interface";
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
    treeBuilder: ITreeBuilder;
    started: boolean;
    constructor(config: EngineConfig);
    handleContextStarted(context: IContextNode): Promise<void>;
    handleContextChanged(context: IContextNode, oldParsedContext: any): void;
    handleContextFinished(context: IContextNode): void;
    start(): Promise<void>;
    stop(): void;
    registerAdapter(adapter: IAdapter): void;
    unregisterAdapter(adapter: IAdapter): void;
    getParserType(ns: string): AdapterType | null;
    createAdapter(type: AdapterType, config?: any): IAdapter;
}
//# sourceMappingURL=engine.d.ts.map