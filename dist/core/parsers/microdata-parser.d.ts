import { IParser, InsertionPoint } from './interface';
export declare class MicrodataParser implements IParser {
    parseContext(element: HTMLElement): any;
    findChildElements(element: HTMLElement): {
        element: HTMLElement;
        contextName: string;
    }[];
    findInsertionPoint(element: HTMLElement, _: string, insertionPoint: string): HTMLElement | null;
    getInsertionPoints(element: HTMLElement): InsertionPoint[];
    static getPropertyValue(element: HTMLElement): string | undefined;
}
//# sourceMappingURL=microdata-parser.d.ts.map