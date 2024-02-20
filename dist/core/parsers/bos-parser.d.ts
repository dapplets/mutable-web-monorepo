import { InsertionType } from '../adapters/interface';
import { IParser, InsertionPoint } from './interface';
export type BosParserConfig = {
    contexts: {
        [name: string]: {
            component?: string;
            props?: {
                [prop: string]: string;
            };
            insertionPoints?: {
                [insPointName: string]: {
                    component?: string;
                    bosLayoutManager?: string;
                    insertionType?: InsertionType;
                };
            };
            children?: string[];
        };
    };
};
export declare class BosParser implements IParser {
    protected config: BosParserConfig;
    constructor(config: BosParserConfig);
    parseContext(element: Element, contextName: string): any;
    findChildElements(element: Element, contextName: string): {
        element: Element;
        contextName: string;
    }[];
    findInsertionPoint(element: Element, contextName: string, insertionPoint: string): Element | null;
    getInsertionPoints(_: Element, contextName: string): InsertionPoint[];
}
/**
 * Executes a template string by replacing placeholders with corresponding values from the provided data object.
 *
 * @param {string} template - The template string containing placeholders in the format '{{key.subkey}}'.
 * @param {Object} data - The data object containing values to replace the placeholders in the template.
 * @returns {string} - The result string after replacing placeholders with actual values.
 *
 * @example
 * const template = "{{props.a}}/{{props.b.c}}";
 * const data = {
 *   props: {
 *     a: 1,
 *     b: {
 *       c: 2
 *     }
 *   }
 * };
 * const result = exec(template, data);
 * console.log(result); // "1/2"
 */
export declare function replaceMustaches(template: string, data: any): string;
//# sourceMappingURL=bos-parser.d.ts.map