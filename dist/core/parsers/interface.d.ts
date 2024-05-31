import { InsertionType } from '../adapters/interface';
export type InsertionPoint = {
    name: string;
    insertionType?: InsertionType;
    bosLayoutManager?: string;
};
export interface IParser {
    parseContext(element: HTMLElement, contextName: string): any;
    findChildElements(element: HTMLElement, contextName: string): {
        element: HTMLElement;
        contextName: string;
    }[];
    findInsertionPoint(element: HTMLElement, contextName: string, insertionPoint: string): HTMLElement | null;
    getInsertionPoints(element: HTMLElement, contextName: string): InsertionPoint[];
}
//# sourceMappingURL=interface.d.ts.map