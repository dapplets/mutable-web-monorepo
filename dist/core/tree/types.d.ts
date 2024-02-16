export type ParsedContext = {
    [key: string]: any;
};
export interface IContextNode {
    id: string | null;
    tagName: string;
    namespaceURI: string;
    parentNode: IContextNode | null;
    parsedContext: ParsedContext;
    insPoints: string[];
    children: IContextNode[];
    removeChild(child: IContextNode): void;
    appendChild(child: IContextNode): void;
}
export interface ITreeBuilder {
    root: IContextNode;
    appendChild(parent: IContextNode, child: IContextNode): void;
    removeChild(parent: IContextNode, child: IContextNode): void;
    updateParsedContext(context: IContextNode, parsedContext: any): void;
    updateInsertionPoints(context: IContextNode, insPoints: string[]): void;
    createNode(namespaceURI: string | null, tagName: string): IContextNode;
}
export interface IContextListener {
    handleContextStarted(context: IContextNode): void;
    handleContextChanged(context: IContextNode, oldParsedContext: any): void;
    handleContextFinished(context: IContextNode): void;
    handleInsPointStarted(context: IContextNode, newInsPoint: string): void;
    handleInsPointFinished(context: IContextNode, oldInsPoint: string): void;
}
//# sourceMappingURL=types.d.ts.map