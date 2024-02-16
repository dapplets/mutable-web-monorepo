import { IContextListener, IContextNode, ITreeBuilder } from '../types';
export declare class DomTreeBuilder implements ITreeBuilder {
    #private;
    root: IContextNode;
    constructor(contextListener: IContextListener);
    appendChild(parent: IContextNode, child: IContextNode): void;
    removeChild(parent: IContextNode, child: IContextNode): void;
    createNode(namespaceURI: string | null, tagName: string): IContextNode;
    updateParsedContext(context: IContextNode, newParsedContext: any): void;
    /**
     * Returns a serialized XML tree
     * @experimental
     */
    getSerializedXmlTree(): string;
}
//# sourceMappingURL=dom-tree-builder.d.ts.map