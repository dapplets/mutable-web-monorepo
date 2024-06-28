/// <reference types="react" />
import { MutationWithSettings } from '../../services/mutation/mutation.entity';
import { Engine } from '../../../engine';
export declare const useMutations: (engine: Engine) => {
    mutations: MutationWithSettings[];
    setMutations: import("react").Dispatch<import("react").SetStateAction<MutationWithSettings[]>>;
    isLoading: boolean;
    error: string | null;
};
//# sourceMappingURL=use-mutations.d.ts.map