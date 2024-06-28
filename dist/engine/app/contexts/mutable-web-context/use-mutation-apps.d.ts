/// <reference types="react" />
import { AppWithSettings } from '../../services/application/application.entity';
import { Mutation } from '../../services/mutation/mutation.entity';
import { Engine } from '../../../engine';
export declare const useMutationApps: (engine: Engine, mutation?: Mutation | null) => {
    mutationApps: AppWithSettings[];
    setMutationApps: import("react").Dispatch<import("react").SetStateAction<AppWithSettings[]>>;
    isLoading: boolean;
    error: string | null;
};
//# sourceMappingURL=use-mutation-apps.d.ts.map