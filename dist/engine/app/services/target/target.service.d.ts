import { IContextNode } from '../../../../core';
import { TransferableContext } from '../../common/transferable-context';
import { ScalarType, TargetCondition, Target } from './target.entity';
export declare class TargetService {
    static isTargetMet(target: Target | TransferableContext, context: IContextNode): boolean;
    static _areConditionsMet(conditions: Record<string, TargetCondition>, values: Record<string, ScalarType>): boolean;
    static _isConditionMet(condition: TargetCondition, value: ScalarType): boolean;
}
//# sourceMappingURL=target.service.d.ts.map