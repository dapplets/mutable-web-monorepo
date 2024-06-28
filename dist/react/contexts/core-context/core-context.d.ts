/// <reference types="react" />
import { Core, IContextNode, ParserConfig } from '../../../core';
export type CoreContextState = {
    core: Core;
    tree: IContextNode | null;
    attachParserConfig: (parserConfig: ParserConfig) => void;
    detachParserConfig: (parserId: string) => void;
    updateRootContext: (rootParsedContext: any) => void;
};
export declare const contextDefaultValues: CoreContextState;
export declare const CoreContext: import("react").Context<CoreContextState>;
//# sourceMappingURL=core-context.d.ts.map