import { IContextNode, ITreeBuilder, InsertionPointWithElement, ParsedContext } from '../types';
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
        insertionPoint: InsertionPointWithElement;
    };
    insertionPointFinished: {
        context: IContextNode;
        insertionPoint: InsertionPointWithElement;
    };
};
export declare class PureTreeBuilder implements ITreeBuilder {
    root: IContextNode;
    constructor();
    appendChild(parent: IContextNode, child: IContextNode): void;
    removeChild(parent: IContextNode, child: IContextNode): void;
    createNode(namespace: string, contextType: string, parsedContext?: any, insPoints?: InsertionPointWithElement[], element?: HTMLElement | null): IContextNode;
    updateParsedContext(context: IContextNode, newParsedContext: any): void;
    updateInsertionPoints(context: IContextNode, foundIPs: InsertionPointWithElement[]): void;
    clear(): void;
}
//# sourceMappingURL=pure-tree-builder.d.ts.map