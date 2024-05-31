import { IParser, InsertionPoint } from './interface';
export declare class MutableWebParser implements IParser {
    parseContext(element: HTMLElement, contextName: string): any;
    findChildElements(element: HTMLElement): {
        element: HTMLElement;
        contextName: string;
    }[];
    findInsertionPoint(element: HTMLElement | ShadowRoot, contextName: string, insertionPoint: string): HTMLElement | null;
    getInsertionPoints(element: HTMLElement): InsertionPoint[];
}
//# sourceMappingURL=mweb-parser.d.ts.map