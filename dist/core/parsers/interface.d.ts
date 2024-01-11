export interface IParser {
    parseContext(element: Element, contextName: string): any;
    findChildElements(element: Element, contextName: string): {
        element: Element;
        contextName: string;
    }[];
    findInsertionPoint(element: Element, contextName: string, insertionPoint: string): Element | null;
}
//# sourceMappingURL=interface.d.ts.map