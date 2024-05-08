import { IParser, InsertionPoint } from './interface';
export declare class MutableWebParser implements IParser {
    parseContext(element: Element, contextName: string): any;
    findChildElements(element: Element): {
        element: Element;
        contextName: string;
    }[];
    findInsertionPoint(element: Element | ShadowRoot, contextName: string, insertionPoint: string): Element | null;
    getInsertionPoints(element: Element): InsertionPoint[];
}
//# sourceMappingURL=mweb-parser.d.ts.map