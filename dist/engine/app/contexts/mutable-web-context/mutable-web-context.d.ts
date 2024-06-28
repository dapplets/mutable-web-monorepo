/// <reference types="react" />
import { Engine } from '../../../engine';
import { AppMetadata, AppWithSettings } from '../../services/application/application.entity';
import { MutationWithSettings } from '../../services/mutation/mutation.entity';
export type MutableWebContextState = {
    engine: Engine;
    mutations: MutationWithSettings[];
    allApps: AppMetadata[];
    mutationApps: AppWithSettings[];
    activeApps: AppWithSettings[];
    selectedMutation: MutationWithSettings | null;
    isLoading: boolean;
    switchMutation: (mutationId: string | null) => void;
    favoriteMutationId: string | null;
    setFavoriteMutation: (mutationId: string | null) => void;
    removeMutationFromRecents: (mutationId: string) => void;
    setMutations: React.Dispatch<React.SetStateAction<MutationWithSettings[]>>;
    setMutationApps: React.Dispatch<React.SetStateAction<AppWithSettings[]>>;
};
export declare const contextDefaultValues: MutableWebContextState;
export declare const MutableWebContext: import("react").Context<MutableWebContextState>;
//# sourceMappingURL=mutable-web-context.d.ts.map