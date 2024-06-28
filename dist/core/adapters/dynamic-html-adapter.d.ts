import { IParser } from '../parsers/interface';
import { IContextNode, ITreeBuilder } from '../tree/types';
import { IAdapter } from './interface';
export declare class DynamicHtmlAdapter implements IAdapter {
    #private;
    protected element: HTMLElement;
    protected treeBuilder: ITreeBuilder;
    protected parser: IParser;
    namespace: string;
    context: IContextNode;
    constructor(element: HTMLElement, treeBuilder: ITreeBuilder, namespace: string, parser: IParser);
    start(): void;
    stop(): void;
    _tryCreateContextForElement(element: HTMLElement, contextName: string): IContextNode | null;
    _tryCreateContextForElement(element: HTMLElement, contextName: string, defaultContextId: string): IContextNode;
    private _handleMutations;
    private _appendNewChildContexts;
    private _removeOldChildContexts;
    private _findAvailableInsPoints;
}
//# sourceMappingURL=dynamic-html-adapter.d.ts.map