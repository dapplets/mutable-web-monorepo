import { IParser, InsertionPoint } from './interface';
export declare class NaiveBosParser implements IParser {
    parseContext(element: Element): any;
    findChildElements(element: Element): {
        element: Element;
        contextName: string;
    }[];
    findInsertionPoint(element: Element, _: string, insertionPoint: string): Element | null;
    getInsertionPoints(element: Element): InsertionPoint[];
}
//# sourceMappingURL=naive-bos-parser.d.ts.map