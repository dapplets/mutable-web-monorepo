import { IContextNode } from '../../../../core';
import { AppId, AppMetadata, AppMetadataTarget } from '../application/application.entity';
import { ApplicationService } from '../application/application.service';
import { MutationId } from '../mutation/mutation.entity';
import { ScalarType, TargetCondition } from '../target/target.entity';
import { BosUserLink, LinkIndexObject, UserLinkId } from './user-link.entity';
import { UserLinkRepository } from './user-link.repository';
export declare class UserLinkSerivce {
    private userLinkRepository;
    private applicationService;
    constructor(userLinkRepository: UserLinkRepository, applicationService: ApplicationService);
    getLinksForContext(appsToCheck: AppMetadata[], mutationId: MutationId, context: IContextNode): Promise<BosUserLink[]>;
    createLink(mutationId: MutationId, appGlobalId: AppId, context: IContextNode): Promise<BosUserLink>;
    deleteUserLink(userLinkId: UserLinkId): Promise<void>;
    private _getUserLinksForTarget;
    static _buildLinkIndex(appId: AppId, mutationId: MutationId, target: AppMetadataTarget, context: IContextNode): LinkIndexObject;
    static _buildIndexedContextValues(conditions: Record<string, TargetCondition>, values: Record<string, ScalarType>): Record<string, ScalarType>;
}
//# sourceMappingURL=user-link.service.d.ts.map