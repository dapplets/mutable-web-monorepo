import { InsertionType } from '../adapters/interface';
import { IParser, InsertionPoint } from './interface';
export type JsonParserConfig = {
    contexts: {
        [name: string]: {
            selector?: string;
            props?: {
                [prop: string]: string;
            };
            insertionPoints?: {
                [insPointName: string]: string | {
                    selector?: string;
                    bosLayoutManager?: string;
                    insertionType?: InsertionType;
                };
            };
            children?: string[];
        };
    };
};
export declare class JsonParser implements IParser {
    protected config: JsonParserConfig;
    constructor(config: JsonParserConfig);
    parseContext(element: HTMLElement, contextName: string): any;
    findChildElements(element: HTMLElement, contextName: string): {
        element: HTMLElement;
        contextName: string;
    }[];
    findInsertionPoint(element: HTMLElement, contextName: string, insertionPoint: string): HTMLElement | null;
    getInsertionPoints(_: HTMLElement, contextName: string): InsertionPoint[];
}
//# sourceMappingURL=json-parser.d.ts.map