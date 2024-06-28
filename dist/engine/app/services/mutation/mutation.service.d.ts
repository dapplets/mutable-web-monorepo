import { IContextNode } from '../../../../core';
import { Mutation, MutationId, MutationWithSettings } from './mutation.entity';
import { MutationRepository } from './mutation.repository';
export declare class MutationService {
    private mutationRepository;
    private nearConfig;
    constructor(mutationRepository: MutationRepository, nearConfig: {
        defaultMutationId: string;
    });
    getMutation(mutationId: string): Promise<Mutation | null>;
    getMutationsForContext(context: IContextNode): Promise<Mutation[]>;
    getMutationsWithSettings(context: IContextNode): Promise<MutationWithSettings[]>;
    getLastUsedMutation: (context: IContextNode) => Promise<string | null>;
    setFavoriteMutation(mutationId: string | null): Promise<void>;
    getFavoriteMutation(): Promise<string | null>;
    createMutation(mutation: Mutation): Promise<MutationWithSettings>;
    editMutation(mutation: Mutation): Promise<MutationWithSettings>;
    removeMutationFromRecents(mutationId: MutationId): Promise<void>;
    updateMutationLastUsage(mutationId: MutationId, hostname: string): Promise<string>;
    populateMutationWithSettings(mutation: Mutation): Promise<MutationWithSettings>;
}
//# sourceMappingURL=mutation.service.d.ts.map