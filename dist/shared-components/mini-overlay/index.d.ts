import { AppWithSettings, Mutation } from '../../engine';
import React, { FC, ReactElement } from 'react';
import { IWalletConnect } from './Profile';
interface IMutationAppsControl {
    enableApp: () => Promise<void>;
    disableApp: () => Promise<void>;
    isLoading: boolean;
}
interface IAppSwitcherProps extends IMutationAppsControl {
    app: AppWithSettings;
}
interface IMiniOverlayProps extends Partial<IWalletConnect> {
    baseMutation: Mutation | null;
    mutationApps: AppWithSettings[];
    children: ReactElement;
    trackingRefs?: Set<React.RefObject<HTMLDivElement>>;
}
export declare const AppSwitcher: FC<IAppSwitcherProps>;
export declare const MiniOverlay: FC<IMiniOverlayProps>;
export {};
//# sourceMappingURL=index.d.ts.map