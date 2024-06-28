/// <reference types="react" />
import { Target } from '../../services/target/target.entity';
import { IContextNode } from '../../../../core';
export type TLatchVariant = 'current' | 'parent' | 'child';
export type PickerTask = {
    target?: Target[];
    onClick?: (context: IContextNode) => void;
    LatchComponent?: React.FC<{
        context: IContextNode;
        variant: TLatchVariant;
        contextDimensions: {
            width: number;
            height: number;
        };
    }>;
};
export type PickerContextState = {
    pickerTask: PickerTask | null;
    setPickerTask: (picker: PickerTask | null) => void;
};
export declare const contextDefaultValues: PickerContextState;
export declare const PickerContext: import("react").Context<PickerContextState>;
//# sourceMappingURL=picker-context.d.ts.map