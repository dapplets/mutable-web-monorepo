import { IContextNode } from '../../../../core';
import { BosUserLink, UserLinkId } from '../../services/user-link/user-link.entity';
import { AppId } from '../../services/application/application.entity';
export declare const useUserLinks: (context: IContextNode) => {
    userLinks: BosUserLink[];
    createUserLink: (appId: AppId) => Promise<void>;
    deleteUserLink: (linkId: UserLinkId) => Promise<void>;
    error: Error | null;
};
//# sourceMappingURL=use-user-links.d.ts.map