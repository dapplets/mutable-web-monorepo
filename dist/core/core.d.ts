import { IAdapter } from './adapters/interface';
import { ParserConfig } from './types';
import { CoreEvents } from './events';
import { Subscription } from './event-emitter';
export interface CoreConfig {
}
export declare class Core {
    private _eventEmitter;
    private _treeBuilder;
    /**
     * @deprecated
     */
    adapters: Map<string, IAdapter>;
    get tree(): import(".").IContextNode;
    constructor(config?: CoreConfig);
    attachParserConfig(parserConfig: ParserConfig): void;
    detachParserConfig(namespace: string): void;
    on<EventName extends keyof CoreEvents>(eventName: EventName, callback: (event: CoreEvents[EventName]) => void): Subscription;
    off<EventName extends keyof CoreEvents>(eventName: EventName, callback: (event: CoreEvents[EventName]) => void): void;
    updateRootContext(rootParsedContext?: any): void;
    clear(): void;
    private _registerAdapter;
    private _unregisterAdapter;
    private _createAdapter;
}
//# sourceMappingURL=core.d.ts.map