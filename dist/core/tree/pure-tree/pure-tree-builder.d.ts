import { IContextListener, IContextNode, ITreeBuilder } from "../types";
export declare class PureTreeBuilder implements ITreeBuilder {
    #private;
    root: IContextNode;
    constructor(contextListener: IContextListener);
    appendChild(parent: IContextNode, child: IContextNode): void;
    removeChild(parent: IContextNode, child: IContextNode): void;
    createNode(namespaceURI: string | null, tagName: string): IContextNode;
    updateParsedContext(context: IContextNode, newParsedContext: any): void;
    updateInsertionPoints(context: IContextNode, foundIPs: string[]): void;
}
//# sourceMappingURL=pure-tree-builder.d.ts.map