import { InsertionType } from '../adapters/interface';
export type InsertionPoint = {
    name: string;
    insertionType?: InsertionType;
    bosLayoutManager?: string;
};
export interface IParser {
    parseContext(element: Element, contextName: string): any;
    findChildElements(element: Element, contextName: string): {
        element: Element;
        contextName: string;
    }[];
    findInsertionPoint(element: Element, contextName: string, insertionPoint: string): Element | null;
    getInsertionPoints(element: Element, contextName: string): InsertionPoint[];
}
//# sourceMappingURL=interface.d.ts.map