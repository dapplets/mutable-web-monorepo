import { IContextNode } from "../../../core";
export interface TransferableContext {
    namespace: string | null;
    type: string;
    id: string | null;
    parsed: any;
    parent: TransferableContext | null;
}
export declare const buildTransferableContext: (context: IContextNode) => TransferableContext;
//# sourceMappingURL=transferable-context.d.ts.map