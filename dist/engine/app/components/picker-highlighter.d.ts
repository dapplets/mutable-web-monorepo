import React, { FC, ReactElement } from 'react';
import { IContextNode } from '../../../core';
interface IPickerHighlighter {
    focusedContext: IContextNode | null;
    context: IContextNode;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    styles?: React.CSSProperties;
    onClick?: () => void;
    highlightChildren?: boolean;
    variant?: 'current' | 'parent' | 'child';
    LatchComponent?: React.FC<{
        context: IContextNode;
        variant: 'current' | 'parent' | 'child';
        contextDimensions: {
            width: number;
            height: number;
        };
    }>;
    children?: ReactElement | ReactElement[];
}
export declare const PickerHighlighter: FC<IPickerHighlighter>;
export {};
//# sourceMappingURL=picker-highlighter.d.ts.map