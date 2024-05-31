import { EventEmitter } from '../../event-emitter';
import { IContextNode, ITreeBuilder, ParsedContext } from '../types';
export type TreeBuilderEvents = {
    contextStarted: {
        context: IContextNode;
    };
    contextFinished: {
        context: IContextNode;
    };
    contextChanged: {
        context: IContextNode;
        previousContext: ParsedContext;
    };
    insertionPointStarted: {
        context: IContextNode;
        insertionPoint: string;
    };
    insertionPointFinished: {
        context: IContextNode;
        insertionPoint: string;
    };
};
export declare class PureTreeBuilder implements ITreeBuilder {
    private _eventEmitter;
    root: IContextNode;
    constructor(_eventEmitter: EventEmitter<TreeBuilderEvents>);
    appendChild(parent: IContextNode, child: IContextNode): void;
    removeChild(parent: IContextNode, child: IContextNode): void;
    createNode(namespace: string, contextType: string, parsedContext?: any, insPoints?: string[], element?: HTMLElement | null): IContextNode;
    updateParsedContext(context: IContextNode, newParsedContext: any): void;
    updateInsertionPoints(context: IContextNode, foundIPs: string[]): void;
    clear(): void;
    private _emitContextStarted;
    private _emitContextChanged;
    private _emitContextFinished;
    private _emitInsPointStarted;
    private _emitInsPointFinished;
}
//# sourceMappingURL=pure-tree-builder.d.ts.map