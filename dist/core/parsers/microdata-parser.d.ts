import { IParser } from "./interface";
export declare class MicrodataParser implements IParser {
    parseContext(element: Element): any;
    findChildElements(element: Element): {
        element: Element;
        contextName: string;
    }[];
    findInsertionPoint(element: Element, _: string, insertionPoint: string): Element | null;
    static getPropertyValue(element: Element): string | undefined;
}
//# sourceMappingURL=microdata-parser.d.ts.map