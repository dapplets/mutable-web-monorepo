import { IContextNode } from "../types";
export declare class PureContextNode implements IContextNode {
    id: string | null;
    tagName: string;
    namespaceURI: string | null;
    parentNode: IContextNode | null;
    parsedContext?: any;
    children: IContextNode[];
    insPoints: string[];
    constructor(namespaceURI: string | null, tagName: string);
    removeChild(child: IContextNode): void;
    appendChild(child: IContextNode): void;
}
//# sourceMappingURL=pure-context-node.d.ts.map