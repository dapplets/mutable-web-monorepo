import { AppMetadata } from '../../services/application/application.entity';
import { Engine } from '../../../engine';
export declare const useApplications: (engine: Engine) => {
    applications: AppMetadata[];
    isLoading: boolean;
    error: string | null;
};
//# sourceMappingURL=use-applications.d.ts.map