import { ParserConfig } from './types';
export declare class Core {
    private _treeBuilder;
    private adapters;
    get tree(): import(".").IContextNode;
    constructor();
    attachParserConfig(parserConfig: ParserConfig): void;
    detachParserConfig(namespace: string): void;
    /**
     * @deprecated
     */
    updateRootContext(rootParsedContext?: any): void;
    clear(): void;
    private _registerAdapter;
    private _unregisterAdapter;
    private _createAdapter;
}
//# sourceMappingURL=core.d.ts.map