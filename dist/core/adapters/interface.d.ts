import { InsertionPoint } from '../parsers/interface';
import { IContextNode } from '../tree/types';
export declare enum InsertionType {
    Before = "before",
    After = "after",
    Begin = "begin",
    End = "end"
}
export interface IAdapter {
    namespace: string;
    context: IContextNode;
    start(): void;
    stop(): void;
    injectElement(element: Element, context: IContextNode, insertionPoint: string): void;
    getInsertionPoints(context: IContextNode): InsertionPoint[];
    getContextElement(context: IContextNode): Element | null;
    getInsertionPointElement(context: IContextNode, insPointName: string): Element | null;
}
//# sourceMappingURL=interface.d.ts.map