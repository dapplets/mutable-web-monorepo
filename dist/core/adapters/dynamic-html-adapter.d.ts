import { IParser, InsertionPoint } from '../parsers/interface';
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
    injectElement(injectingElement: HTMLElement, context: IContextNode, insertionPoint: string | 'root'): void;
    getInsertionPoints(context: IContextNode): InsertionPoint[];
    getContextElement(context: IContextNode): HTMLElement | null;
    getInsertionPointElement(context: IContextNode, insPointName: string): HTMLElement | null;
    _createContextForElement(element: HTMLElement, contextName: string): IContextNode;
    private _handleMutations;
    private _appendNewChildContexts;
    private _removeOldChildContexts;
    private _findAvailableInsPoints;
}
//# sourceMappingURL=dynamic-html-adapter.d.ts.map