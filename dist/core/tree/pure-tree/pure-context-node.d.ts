import { IContextNode } from '../types';
export declare class PureContextNode implements IContextNode {
    id: string | null;
    contextType: string;
    namespace: string;
    parentNode: IContextNode | null;
    parsedContext: any;
    children: IContextNode[];
    insPoints: string[];
    element: HTMLElement | null;
    constructor(namespace: string, contextType: string, parsedContext?: any, insPoints?: string[], element?: HTMLElement | null);
    removeChild(child: IContextNode): void;
    appendChild(child: IContextNode): void;
}
//# sourceMappingURL=pure-context-node.d.ts.map