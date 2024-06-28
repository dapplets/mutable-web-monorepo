import React, { ReactElement } from 'react';
import { InjectableTarget } from '../engine-context/engine-context';
export type THighlighterTask = {
    target: InjectableTarget;
    styles?: React.CSSProperties;
    isFilled?: boolean;
    icon?: ReactElement;
    action?: () => void;
};
export type THighlighterContextState = {
    highlighterTask: THighlighterTask | null;
    setHighlighterTask: (picker: THighlighterTask | null) => void;
};
export declare const HighlighterContext: React.Context<THighlighterContextState>;
//# sourceMappingURL=highlighter-context.d.ts.map