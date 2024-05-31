import { IParser, InsertionPoint } from './interface';
export declare class NaiveBosParser implements IParser {
    parseContext(element: HTMLElement): any;
    findChildElements(element: HTMLElement): {
        element: HTMLElement;
        contextName: string;
    }[];
    findInsertionPoint(element: HTMLElement, _: string, insertionPoint: string): HTMLElement | null;
    getInsertionPoints(element: HTMLElement): InsertionPoint[];
}
//# sourceMappingURL=naive-bos-parser.d.ts.map