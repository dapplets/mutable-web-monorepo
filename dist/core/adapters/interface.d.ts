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
}
//# sourceMappingURL=interface.d.ts.map