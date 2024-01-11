import { IParser } from "./interface";
export type ParserConfig = {
    namespace: string;
    contexts: {
        [name: string]: {
            selector?: string;
            props?: {
                [prop: string]: string;
            };
            insertionPoints?: {
                [insPointName: string]: string;
            };
            children?: string[];
        };
    };
};
export declare class JsonParser implements IParser {
    protected config: ParserConfig;
    constructor(config: ParserConfig);
    parseContext(element: Element, contextName: string): any;
    findChildElements(element: Element, contextName: string): {
        element: Element;
        contextName: string;
    }[];
    findInsertionPoint(element: Element, contextName: string, insertionPoint: string): Element | null;
}
//# sourceMappingURL=json-parser.d.ts.map