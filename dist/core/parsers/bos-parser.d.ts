import { IParser } from "./interface";
export declare class BosParser implements IParser {
    parseContext(element: Element): any;
    findChildElements(element: Element): {
        element: Element;
        contextName: string;
    }[];
    findInsertionPoint(element: Element, _: string, insertionPoint: string): Element | null;
}
//# sourceMappingURL=bos-parser.d.ts.map