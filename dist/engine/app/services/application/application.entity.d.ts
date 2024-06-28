import { Target } from '../target/target.entity';
export type AppId = string;
export type AppMetadataTarget = Target & {
    componentId: string;
    injectTo: string;
    injectOnce?: boolean;
};
export type AppMetadata = {
    id: AppId;
    authorId: string;
    appLocalId: string;
    targets: AppMetadataTarget[];
    metadata: {
        name?: string;
        description?: string;
        image?: {
            ipfs_cid?: string;
        };
    };
};
export type AppWithSettings = AppMetadata & {
    settings: {
        isEnabled: boolean;
    };
};
//# sourceMappingURL=application.entity.d.ts.map