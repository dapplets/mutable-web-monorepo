import { LocalDbService } from '../local-db/local-db.service';
import { SocialDbService } from '../social-db/social-db.service';
import { Mutation, MutationId } from './mutation.entity';
export declare class MutationRepository {
    private socialDb;
    private localDb;
    constructor(socialDb: SocialDbService, localDb: LocalDbService);
    getMutation(globalMutationId: MutationId): Promise<Mutation | null>;
    getMutations(): Promise<Mutation[]>;
    saveMutation(mutation: Mutation): Promise<Mutation>;
    getFavoriteMutation(): Promise<string | null | undefined>;
    setFavoriteMutation(mutationId: string | null | undefined): Promise<void>;
    getMutationLastUsage(mutationId: string, hostname: string): Promise<string | null>;
    setMutationLastUsage(mutationId: string, value: string | null, hostname: string): Promise<void>;
}
//# sourceMappingURL=mutation.repository.d.ts.map