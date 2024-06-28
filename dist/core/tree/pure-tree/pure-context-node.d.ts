import { Subscription } from '../../event-emitter';
import { IContextNode, InsertionPointWithElement, TreeNodeEvents } from '../types';
export declare class PureContextNode implements IContextNode {
    #private;
    id: string | null;
    contextType: string;
    namespace: string;
    parentNode: IContextNode | null;
    children: IContextNode[];
    insPoints: InsertionPointWithElement[];
    element: HTMLElement | null;
    get parsedContext(): any;
    set parsedContext(parsedContext: any);
    constructor(namespace: string, contextType: string, parsedContext?: any, insPoints?: InsertionPointWithElement[], element?: HTMLElement | null);
    removeChild(child: IContextNode): void;
    appendChild(child: IContextNode): void;
    appendInsPoint(insertionPoint: InsertionPointWithElement): void;
    removeInsPoint(insertionPointName: string): void;
    on<EventName extends keyof TreeNodeEvents>(eventName: EventName, callback: (event: TreeNodeEvents[EventName]) => void): Subscription;
}
//# sourceMappingURL=pure-context-node.d.ts.map