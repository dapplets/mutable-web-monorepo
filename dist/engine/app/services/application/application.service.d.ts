import { IContextNode } from '../../../../core';
import { MutationId } from '../mutation/mutation.entity';
import { AppId, AppMetadata, AppWithSettings } from './application.entity';
import { ApplicationRepository } from './application.repository';
export declare class ApplicationService {
    private applicationRepository;
    constructor(applicationRepository: ApplicationRepository);
    getApplications(): Promise<AppMetadata[]>;
    getApplication(appId: AppId): Promise<AppMetadata | null>;
    getAppEnabledStatus(mutationId: MutationId, appId: AppId): Promise<boolean>;
    filterSuitableApps(appsToCheck: AppMetadata[], context: IContextNode): AppMetadata[];
    enableAppInMutation(mutationId: MutationId, appId: AppId): Promise<void>;
    disableAppInMutation(mutationId: MutationId, appId: AppId): Promise<void>;
    populateAppWithSettings(mutationId: MutationId, app: AppMetadata): Promise<AppWithSettings>;
}
//# sourceMappingURL=application.service.d.ts.map