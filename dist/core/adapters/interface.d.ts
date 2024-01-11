import { IContextNode } from "../tree/types";
export declare enum InsertionType {
    Before = "before",
    After = "after",
    Inside = "inside"
}
export interface IAdapter {
    namespace: string;
    context: IContextNode;
    start(): void;
    stop(): void;
    injectElement(element: Element, context: IContextNode, insertionPoint: string, insertionType: InsertionType): void;
}
//# sourceMappingURL=interface.d.ts.map