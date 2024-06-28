import { LocalDbService } from '../local-db/local-db.service';
import { SocialDbService } from '../social-db/social-db.service';
import { AppId, AppMetadata } from './application.entity';
export declare class ApplicationRepository {
    private socialDb;
    private localDb;
    constructor(socialDb: SocialDbService, localDb: LocalDbService);
    getApplication(globalAppId: AppId): Promise<AppMetadata | null>;
    getApplications(): Promise<AppMetadata[]>;
    saveApplication(appMetadata: Omit<AppMetadata, 'authorId' | 'appLocalId'>): Promise<AppMetadata>;
    getAppEnabledStatus(mutationId: string, appId: string): Promise<boolean>;
    setAppEnabledStatus(mutationId: string, appId: string, isEnabled: boolean): Promise<void>;
}
//# sourceMappingURL=application.repository.d.ts.map