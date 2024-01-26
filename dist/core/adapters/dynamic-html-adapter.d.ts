import { IParser, InsertionPoint } from "../parsers/interface";
import { IContextNode, ITreeBuilder } from "../tree/types";
import { IAdapter, InsertionType } from "./interface";
export declare class DynamicHtmlAdapter implements IAdapter {
    #private;
    protected element: Element;
    protected treeBuilder: ITreeBuilder;
    protected parser: IParser;
    namespace: string;
    context: IContextNode;
    constructor(element: Element, treeBuilder: ITreeBuilder, namespace: string, parser: IParser);
    start(): void;
    stop(): void;
    injectElement(injectingElement: Element, context: IContextNode, insertionPoint: string | "root", insertionType: InsertionType): void;
    getInsertionPoints(context: IContextNode): InsertionPoint[];
    _createContextForElement(element: Element, contextName: string): IContextNode;
    private _handleMutations;
    private _appendNewChildContexts;
    private _removeOldChildContexts;
    private _findAvailableInsPoints;
}
//# sourceMappingURL=dynamic-html-adapter.d.ts.map